require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configuration
const PORT = process.env.PORT || 3000;
const AUTHORIZED_EMAILS = process.env.AUTHORIZED_EMAILS 
  ? process.env.AUTHORIZED_EMAILS.split(',').map(email => email.trim())
  : [];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'seedbringer-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/auth/google/callback`
);

// Store for active sessions (in production, use Redis or similar)
const activeSessions = new Map();

// Authentication Middleware
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initiate Google OAuth
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Check if email is authorized
    if (!AUTHORIZED_EMAILS.includes(data.email)) {
      return res.redirect('/?error=unauthorized_email');
    }

    // Store user in session
    req.session.user = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture
    };

    // Store in active sessions
    activeSessions.set(data.id, {
      user: req.session.user,
      tokens: tokens,
      connectedAt: new Date()
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/?error=auth_failed');
  }
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

// Logout
app.post('/api/logout', (req, res) => {
  const userId = req.session.user?.id;
  if (userId) {
    activeSessions.delete(userId);
  }
  req.session.destroy();
  res.json({ success: true });
});

// Get active sessions (admin only - simplified version)
app.get('/api/sessions', requireAuth, (req, res) => {
  const sessions = Array.from(activeSessions.values()).map(session => ({
    email: session.user.email,
    name: session.user.name,
    connectedAt: session.connectedAt
  }));
  res.json({ sessions });
});

// Send message to all connected users
app.post('/api/broadcast', requireAuth, (req, res) => {
  const { message } = req.body;
  const sender = req.session.user;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const messageData = {
    id: Date.now(),
    sender: {
      name: sender.name,
      email: sender.email
    },
    message: message,
    timestamp: new Date()
  };

  // Broadcast to all connected sockets
  io.emit('message', messageData);

  res.json({ success: true, messageData });
});

// Dashboard page
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);

  // Handle user authentication via socket
  socket.on('authenticate', (userId) => {
    const session = activeSessions.get(userId);
    if (session) {
      socket.userId = userId;
      socket.userEmail = session.user.email;
      console.log(`User authenticated: ${session.user.email}`);
      
      // Notify others of new connection
      socket.broadcast.emit('user_joined', {
        email: session.user.email,
        name: session.user.name
      });
    }
  });

  // Handle incoming messages
  socket.on('send_message', (data) => {
    const session = activeSessions.get(socket.userId);
    if (session) {
      const messageData = {
        id: Date.now(),
        sender: {
          name: session.user.name,
          email: session.user.email
        },
        message: data.message,
        timestamp: new Date()
      };

      // Broadcast to all clients
      io.emit('message', messageData);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected:', socket.id);
    if (socket.userId) {
      const session = activeSessions.get(socket.userId);
      if (session) {
        socket.broadcast.emit('user_left', {
          email: session.user.email,
          name: session.user.name
        });
      }
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Seedbringer Rhythmind Interface running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Authorized emails: ${AUTHORIZED_EMAILS.length} configured`);
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('WARNING: Google OAuth credentials not configured!');
    console.warn('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
  }
});

module.exports = server;
