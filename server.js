require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const setupGoogle = require('./auth/google-oauth').setupGoogleStrategy;
const { setupWSS } = require('./ws-handler');

const app = express();
app.use(express.json());
app.use(cookieParser());

setupGoogle(passport);

app.use(passport.initialize());

// Start HTTP server (WSS will attach to this)
const server = http.createServer(app);

// Simple health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start OAuth flow
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.displayName,
      iss: 'seedbringer'
    };
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'change_this_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '8h' });
    res.cookie('sb_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    // Redirect to UI root
    res.redirect('/');
  }
);

app.get('/auth/failure', (req, res) => res.status(401).send('Authentication failed.'));

app.get('/me', (req, res) => {
  const token = req.cookies.sb_token || req.query.token;
  if (!token) return res.json({ authenticated: false });
  try {
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'change_this_secret';
    const data = jwt.verify(token, secret);
    return res.json({ authenticated: true, user: data });
  } catch (e) {
    return res.json({ authenticated: false });
  }
});

// Serve static UI
app.use(express.static('public'));

// Attach WebSocket server
setupWSS(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Seedbringer interface listening on ${PORT}`));
