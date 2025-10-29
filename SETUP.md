# Seedbringer Rhythmind Interface - Setup Guide

## Overview

The Seedbringer Rhythmind Interface is a secure, real-time communication platform that uses Gmail OAuth 2.0 for authentication and WebSocket technology for bidirectional messaging.

## Features

- 🔐 **Secure Gmail OAuth 2.0 Authentication** - No password management required
- 💬 **Real-time Bidirectional Communication** - Instant messaging between authenticated users
- 📡 **GGI Broadcast Interface Integration** - Enhanced functionality for broadcast communications
- 🔒 **Session Management** - Secure user session handling
- 👥 **Multi-user Support** - Support for multiple concurrent authenticated users

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Cloud Platform account
- Gmail accounts for authorized users

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hannesmitterer/Seedbringer-rhythmind-interface.git
   cd Seedbringer-rhythmind-interface
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your configuration (see Configuration section below).

## Configuration

### Setting up Google OAuth 2.0

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com/

2. **Create a new project:**
   - Click "Select a project" → "New Project"
   - Name: "Seedbringer Interface"
   - Click "Create"

3. **Enable Gmail API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Seedbringer Web Client"
   - Authorized redirect URIs:
     - http://localhost:3000/auth/google/callback
     - (Add your production URL when deploying)
   - Click "Create"

5. **Copy credentials to .env:**
   - Copy the Client ID to `GOOGLE_CLIENT_ID`
   - Copy the Client Secret to `GOOGLE_CLIENT_SECRET`

### Environment Variables

Edit your `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Session Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=your_random_session_secret_here

# Authorized Email Addresses
AUTHORIZED_EMAILS=hannes.mitterer@gmail.com,alfred.mitterer@gmail.com,consultant.laquila@gmail.com,dietmar.zuegg@gmail.com,sensisara81@gmail.com,cranedeathrow007@gmail.com,claudiocalabrese@gmx.com
```

### Generating a Session Secret

Run this command to generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to your `.env` file as `SESSION_SECRET`.

## Running the Application

### Development Mode

```bash
npm start
```

The application will be available at http://localhost:3000

### Production Mode

1. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   # Set other environment variables
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

## Usage

### Authentication Flow

1. Navigate to http://localhost:3000
2. Click "Sign in with Gmail"
3. Select your Google account
4. Grant permissions to the application
5. You will be redirected to the dashboard if your email is authorized

### Dashboard Features

**Active Sessions Panel:**
- View all currently connected users
- See connection timestamps

**Communication Area:**
- Send messages to all connected users
- Receive real-time messages
- View message history

**Connection Status:**
- Real-time connection indicator
- Shows WebSocket connection status

### Sending Messages

1. Type your message in the text area
2. Press Enter or click "Send Message"
3. Your message will be broadcast to all connected users
4. Use Shift+Enter for multi-line messages

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback endpoint
- `POST /api/logout` - Logout current user

### User Management

- `GET /api/user` - Get current authenticated user
- `GET /api/sessions` - Get list of active sessions (requires authentication)

### Messaging

- `POST /api/broadcast` - Send message to all users (requires authentication)

## WebSocket Events

### Client → Server

- `authenticate` - Authenticate socket connection with user ID
- `send_message` - Send a message to all connected users

### Server → Client

- `message` - Receive a message from another user
- `user_joined` - Notification when a user joins
- `user_left` - Notification when a user leaves

## Security Features

### Authentication
- OAuth 2.0 for secure, delegated authentication
- No password storage or management
- Email whitelist for access control

### Session Management
- Secure session cookies
- Session expiration
- CSRF protection

### API Key Protection
- All credentials stored in environment variables
- `.gitignore` configured to exclude sensitive files
- No hardcoded secrets in source code

## Authorized Users

The following email addresses are authorized to access the interface:

- hannes.mitterer@gmail.com
- alfred.mitterer@gmail.com
- consultant.laquila@gmail.com
- dietmar.zuegg@gmail.com
- sensisara81@gmail.com
- cranedeathrow007@gmail.com
- claudiocalabrese@gmx.com

To add or remove authorized users, update the `AUTHORIZED_EMAILS` environment variable.

## Troubleshooting

### "Authentication failed: No authorization code received"

**Cause:** OAuth flow was interrupted or cancelled.

**Solution:** Try logging in again.

### "Access denied: Your email is not authorized"

**Cause:** Your email is not in the authorized list.

**Solution:** Contact the administrator to add your email to `AUTHORIZED_EMAILS`.

### "WebSocket disconnected"

**Cause:** Network issue or server restart.

**Solution:** The page will automatically attempt to reconnect. Refresh if needed.

### OAuth redirect URI mismatch

**Cause:** The redirect URI in Google Cloud Console doesn't match your configuration.

**Solution:** 
1. Check your `.env` file for the correct `GOOGLE_REDIRECT_URI`
2. Update Google Cloud Console credentials with the matching URI
3. Restart the server

## Deployment

### Deploying to Production

1. **Update environment variables:**
   - Set `NODE_ENV=production`
   - Update `GOOGLE_REDIRECT_URI` to your production URL
   - Add production redirect URI to Google Cloud Console

2. **Update authorized redirect URIs in Google Cloud Console:**
   - Add `https://yourdomain.com/auth/google/callback`

3. **Use a process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name seedbringer-interface
   pm2 save
   pm2 startup
   ```

4. **Set up HTTPS:**
   - Use a reverse proxy like nginx
   - Configure SSL certificates (Let's Encrypt recommended)

### Environment Variable Management

**Never commit sensitive data to version control.**

For production deployment:
- Use environment variable management (e.g., Heroku Config Vars, AWS Parameter Store)
- Or use a secrets management service (e.g., HashiCorp Vault)

## Development

### Project Structure

```
Seedbringer-rhythmind-interface/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── index.html
│   └── dashboard.html
├── .env.example
├── .gitignore
├── package.json
├── server.js
├── README.md
└── SETUP.md
```

### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Create an issue on GitHub
- Contact the Seedbringer Collective

## License

MIT License - See LICENSE file for details

---

**Branch:** direct-channel-setup  
**Maintainer:** Seedbringer Collective  
**Last Updated:** 2024
