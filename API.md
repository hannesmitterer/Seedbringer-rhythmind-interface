# API Documentation - Seedbringer Rhythmind Interface

## Overview

This document describes the REST API and WebSocket API for the Seedbringer Rhythmind Interface.

## Base URL

```
Development: http://localhost:3000
Production: https://yourdomain.com
```

## Authentication

All API endpoints (except authentication endpoints) require a valid session cookie obtained through the OAuth 2.0 flow.

---

## REST API Endpoints

### Authentication Endpoints

#### Initiate Google OAuth

```
GET /auth/google
```

**Description:** Redirects user to Google OAuth consent screen.

**Response:** HTTP 302 Redirect to Google OAuth

**Example:**
```bash
curl http://localhost:3000/auth/google
```

---

#### OAuth Callback

```
GET /auth/google/callback?code={authorization_code}
```

**Description:** Handles OAuth callback from Google.

**Query Parameters:**
- `code` (string, required): Authorization code from Google

**Response:** 
- Success: HTTP 302 Redirect to `/dashboard`
- Failure: HTTP 302 Redirect to `/?error={error_type}`

**Error Types:**
- `no_code` - No authorization code received
- `unauthorized_email` - Email not in authorized list
- `auth_failed` - Authentication process failed

---

### User Endpoints

#### Get Current User

```
GET /api/user
```

**Description:** Returns information about the currently authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "123456789",
    "email": "hannes.mitterer@gmail.com",
    "name": "Hannes Mitterer",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated

**Example:**
```bash
curl -H "Cookie: connect.sid=..." http://localhost:3000/api/user
```

---

#### Logout

```
POST /api/logout
```

**Description:** Logs out the current user and destroys their session.

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Success

**Example:**
```bash
curl -X POST -H "Cookie: connect.sid=..." http://localhost:3000/api/logout
```

---

### Session Endpoints

#### Get Active Sessions

```
GET /api/sessions
```

**Description:** Returns a list of all currently active user sessions.

**Authentication:** Required

**Response:**
```json
{
  "sessions": [
    {
      "email": "hannes.mitterer@gmail.com",
      "name": "Hannes Mitterer",
      "connectedAt": "2024-10-29T22:45:00.000Z"
    },
    {
      "email": "alfred.mitterer@gmail.com",
      "name": "Alfred Mitterer",
      "connectedAt": "2024-10-29T22:46:15.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated

**Example:**
```bash
curl -H "Cookie: connect.sid=..." http://localhost:3000/api/sessions
```

---

### Messaging Endpoints

#### Broadcast Message

```
POST /api/broadcast
```

**Description:** Sends a message to all connected users via WebSocket.

**Authentication:** Required

**Request Body:**
```json
{
  "message": "Hello, everyone!"
}
```

**Response:**
```json
{
  "success": true,
  "messageData": {
    "id": 1730241900000,
    "sender": {
      "name": "Hannes Mitterer",
      "email": "hannes.mitterer@gmail.com"
    },
    "message": "Hello, everyone!",
    "timestamp": "2024-10-29T22:45:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Message is empty or invalid
- `401 Unauthorized` - Not authenticated

**Example:**
```bash
curl -X POST \
  -H "Cookie: connect.sid=..." \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, everyone!"}' \
  http://localhost:3000/api/broadcast
```

---

## WebSocket API

### Connection

**Endpoint:** `ws://localhost:3000` (or `wss://` for production)

**Description:** Establishes a WebSocket connection for real-time bidirectional communication.

**Example (JavaScript):**
```javascript
const socket = io();
```

---

### Events - Client to Server

#### authenticate

**Description:** Authenticates the WebSocket connection with user ID.

**Payload:**
```javascript
socket.emit('authenticate', userId);
```

**Parameters:**
- `userId` (string): The unique user ID from the session

**Example:**
```javascript
socket.emit('authenticate', '123456789');
```

---

#### send_message

**Description:** Sends a message to all connected users.

**Payload:**
```javascript
socket.emit('send_message', {
  message: 'Your message here'
});
```

**Parameters:**
- `message` (string): The message content

**Example:**
```javascript
socket.emit('send_message', {
  message: 'Hello, Council members!'
});
```

---

### Events - Server to Client

#### connect

**Description:** Emitted when the WebSocket connection is established.

**Example:**
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

---

#### disconnect

**Description:** Emitted when the WebSocket connection is lost.

**Example:**
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

#### message

**Description:** Receives a message from another user.

**Payload:**
```javascript
{
  "id": 1730241900000,
  "sender": {
    "name": "Hannes Mitterer",
    "email": "hannes.mitterer@gmail.com"
  },
  "message": "Hello, everyone!",
  "timestamp": "2024-10-29T22:45:00.000Z"
}
```

**Example:**
```javascript
socket.on('message', (data) => {
  console.log(`${data.sender.name}: ${data.message}`);
});
```

---

#### user_joined

**Description:** Notification when a new user joins the channel.

**Payload:**
```javascript
{
  "email": "hannes.mitterer@gmail.com",
  "name": "Hannes Mitterer"
}
```

**Example:**
```javascript
socket.on('user_joined', (user) => {
  console.log(`${user.name} joined the channel`);
});
```

---

#### user_left

**Description:** Notification when a user leaves the channel.

**Payload:**
```javascript
{
  "email": "hannes.mitterer@gmail.com",
  "name": "Hannes Mitterer"
}
```

**Example:**
```javascript
socket.on('user_left', (user) => {
  console.log(`${user.name} left the channel`);
});
```

---

## Complete WebSocket Integration Example

```javascript
// Initialize Socket.IO
const socket = io();

// Handle connection
socket.on('connect', () => {
  console.log('Connected');
  // Authenticate with user ID
  socket.emit('authenticate', currentUser.id);
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected');
});

// Send a message
function sendMessage(text) {
  socket.emit('send_message', { message: text });
}

// Receive messages
socket.on('message', (data) => {
  displayMessage(data);
});

// User joined notification
socket.on('user_joined', (user) => {
  console.log(`${user.name} joined`);
});

// User left notification
socket.on('user_left', (user) => {
  console.log(`${user.name} left`);
});
```

---

## Error Handling

### HTTP Errors

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**400 Bad Request:**
```json
{
  "error": "Message is required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

### WebSocket Errors

WebSocket errors are handled through the `disconnect` event and reconnection logic in Socket.IO.

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding rate limiting middleware to prevent abuse.

---

## Security Considerations

1. **HTTPS:** Always use HTTPS in production
2. **CORS:** Configure appropriate CORS policies
3. **Session Security:** Use secure session cookies in production
4. **Input Validation:** All user inputs are sanitized
5. **Email Whitelist:** Only authorized emails can access the system

---

## Testing the API

### Using cURL

**Test Authentication Status:**
```bash
curl -i http://localhost:3000/api/user
```

**Test Broadcast (with session cookie):**
```bash
curl -X POST \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message"}' \
  http://localhost:3000/api/broadcast
```

### Using Postman

1. Import the base URL
2. Configure cookie handling
3. First authenticate via browser to get session cookie
4. Use the session cookie in Postman requests

---

## Future Enhancements

Potential API improvements:

- Direct messaging between specific users
- Message persistence and history
- File attachments
- Rich text formatting
- Read receipts
- Typing indicators
- User presence status

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Maintainer:** Seedbringer Collective
