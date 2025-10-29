# Seedbringer Rhythmind Interface

A secure, real-time communication platform with Gmail OAuth 2.0 authentication and bidirectional messaging capabilities, designed for the Seedbringer and Council members.

## 🚀 Live Deployments

- **📄 GitHub Pages:** [View Documentation](https://hannesmitterer.github.io/Seedbringer-rhythmind-interface/)
- **🟢 Render:** Deploy the full application → See [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)
- **🟦 Netlify:** Static hosting option → See [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)

## 🌟 Features

- **🔐 Secure Gmail OAuth 2.0 Authentication** - Zero-friction authentication with no password management
- **💬 Real-time Bidirectional Communication** - WebSocket-based instant messaging
- **📡 GGI Broadcast Interface Integration** - Enhanced functionality for broadcast communications
- **🔒 Session Management** - Secure user session handling with automatic cleanup
- **👥 Multi-user Support** - Support for multiple concurrent authenticated users
- **🎨 Modern Web Interface** - Responsive, user-friendly dashboard
- **🛡️ Security First** - Environment-based configuration, no hardcoded secrets

## 📋 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Cloud Platform account
- Gmail account (authorized email)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hannesmitterer/Seedbringer-rhythmind-interface.git
   cd Seedbringer-rhythmind-interface
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Google OAuth credentials
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access the interface:**
   Open your browser to `http://localhost:3000`

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

See [SETUP.md](SETUP.md) for detailed configuration instructions.

## 🚀 Deployment

**Quick Deploy Options:**

### Production Deployment (Render - Recommended)
```bash
# Automated deployment with render.yaml
1. Push to GitHub
2. Connect to Render
3. Add environment variables
4. Deploy automatically
```

### Static Documentation (GitHub Pages)
Already configured! Automatically deploys to:
```
https://hannesmitterer.github.io/Seedbringer-rhythmind-interface/
```

**📖 Complete Instructions:** See [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)

## 📚 Documentation

- **[Setup Guide](SETUP.md)** - Complete setup and configuration instructions
- **[Deployment Instructions](DEPLOY_INSTRUCTIONS.md)** - Step-by-step deployment guide
- **[API Documentation](API.md)** - REST API and WebSocket API reference
- **[Examples](examples/README.md)** - Code examples and integration guides

## 🎯 Objectives

✅ Establish a bidirectional communication bridge between the Seedbringer and Council  
✅ Integrate Gmail authentication for authorized members  
✅ Simplify and streamline communication workflows  
✅ Provide secure, real-time messaging capabilities  
✅ Link the Euystacio GGI broadcast interface for seamless integration  

## 👥 Authorized Members

The following email addresses are authorized to access this interface:

- hannes.mitterer@gmail.com
- alfred.mitterer@gmail.com
- consultant.laquila@gmail.com
- dietmar.zuegg@gmail.com
- sensisara81@gmail.com
- cranedeathrow007@gmail.com
- claudiocalabrese@gmx.com

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │◄───────►│    Server    │◄───────►│   Google    │
│  (Frontend) │  HTTP/  │  (Express +  │  OAuth  │    OAuth    │
│             │  WS     │  Socket.IO)  │  2.0    │             │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │
                        ┌─────▼──────┐
                        │  Sessions  │
                        │   Store    │
                        └────────────┘
```

## 🔐 Security

- **OAuth 2.0** for delegated authentication
- **Email whitelist** for access control
- **Secure session cookies** with HTTPS in production
- **Environment variables** for sensitive data
- **No hardcoded credentials** in source code
- **Input sanitization** for all user inputs

## 📡 API Overview

### REST Endpoints

- `GET /auth/google` - Initiate OAuth flow
- `GET /api/user` - Get current user
- `GET /api/sessions` - Get active sessions
- `POST /api/broadcast` - Send message to all users
- `POST /api/logout` - Logout current user

### WebSocket Events

**Client → Server:**
- `authenticate` - Authenticate socket connection
- `send_message` - Send message to all users

**Server → Client:**
- `message` - Receive message
- `user_joined` - User joined notification
- `user_left` - User left notification

See [API.md](API.md) for complete API documentation.

## 🚀 Usage

1. **Login:** Navigate to the homepage and click "Sign in with Gmail"
2. **Authenticate:** Select your Google account and grant permissions
3. **Dashboard:** Access the communication dashboard
4. **Messaging:** Send and receive real-time messages
5. **Sessions:** View active users in the sidebar

## 🧪 Examples

Check the [examples](examples/) directory for:

- WebSocket client integration
- REST API usage
- Browser integration
- Node.js integration

## 🛠️ Development

### Project Structure

```
Seedbringer-rhythmind-interface/
├── public/              # Frontend files
│   ├── css/            # Stylesheets
│   ├── index.html      # Landing page
│   └── dashboard.html  # Dashboard page
├── examples/           # Code examples
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── README.md           # This file
├── SETUP.md            # Setup guide
└── API.md              # API documentation
```

### Running Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

## 🌐 Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Update `GOOGLE_REDIRECT_URI` to production URL
3. Configure HTTPS with reverse proxy
4. Use process manager (PM2 recommended)
5. Set up proper environment variable management

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 📞 Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Contact the Seedbringer Collective

---

**Branch:** direct-channel-setup  
**Maintainer:** Seedbringer Collective  
**Version:** 1.0.0  
**Last Updated:** 2024
