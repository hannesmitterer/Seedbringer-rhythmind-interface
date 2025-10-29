# Examples

This directory contains example code demonstrating how to use the Seedbringer Rhythmind Interface.

## Available Examples

### 1. Basic WebSocket Client (`basic-client.js`)

Demonstrates:
- Connecting to the WebSocket server
- Authenticating a connection
- Sending messages
- Receiving messages
- Handling user join/leave events

**Usage:**
```bash
node examples/basic-client.js
```

**Prerequisites:**
- Server must be running
- Socket.io-client must be installed: `npm install socket.io-client`

### 2. REST API Usage (`api-usage.js`)

Demonstrates:
- Getting current user information
- Fetching active sessions
- Broadcasting messages via REST API
- Logging out

**Usage:**
```bash
node examples/api-usage.js
```

**Prerequisites:**
- Server must be running
- Valid session cookie (obtain by logging in through browser first)
- Axios must be installed: `npm install axios`

## Getting Started

1. **Install example dependencies:**
   ```bash
   cd examples
   npm install socket.io-client axios
   ```

2. **Start the main server:**
   ```bash
   cd ..
   npm start
   ```

3. **Run an example in a new terminal:**
   ```bash
   node examples/basic-client.js
   ```

## Obtaining a Session Cookie

For REST API examples, you need a valid session cookie:

1. Start the server: `npm start`
2. Open browser and navigate to `http://localhost:3000`
3. Sign in with an authorized Gmail account
4. Open browser DevTools (F12)
5. Go to Application/Storage → Cookies
6. Copy the `connect.sid` cookie value
7. Use it in the examples: `connect.sid=YOUR_COOKIE_VALUE`

## Example Output

### Basic WebSocket Client

```
Example client started. Press Ctrl+C to exit.

✓ Connected to Seedbringer Interface
Socket ID: abc123xyz
✓ Authentication request sent

📤 Sent: Hello from the example client!

📨 New Message:
From: Hannes Mitterer (hannes.mitterer@gmail.com)
Message: Hello from the example client!
Time: 10/29/2024, 10:45:00 PM
```

### REST API Usage

```
=== Seedbringer API Examples ===

Current User:
{
  "user": {
    "id": "123456789",
    "email": "hannes.mitterer@gmail.com",
    "name": "Hannes Mitterer",
    "picture": "https://..."
  }
}

Active Sessions:
{
  "sessions": [
    {
      "email": "hannes.mitterer@gmail.com",
      "name": "Hannes Mitterer",
      "connectedAt": "2024-10-29T22:45:00.000Z"
    }
  ]
}

Message Broadcasted:
{
  "success": true,
  "messageData": {
    "id": 1730241900000,
    "sender": {
      "name": "Hannes Mitterer",
      "email": "hannes.mitterer@gmail.com"
    },
    "message": "Hello from the API example!",
    "timestamp": "2024-10-29T22:45:00.000Z"
  }
}
```

## Integration Examples

### Browser Integration

```html
<!DOCTYPE html>
<html>
<head>
  <script src="/socket.io/socket.io.js"></script>
</head>
<body>
  <script>
    const socket = io();
    
    socket.on('connect', () => {
      console.log('Connected!');
      socket.emit('authenticate', userId);
    });
    
    socket.on('message', (data) => {
      console.log('New message:', data);
    });
    
    function sendMessage(text) {
      socket.emit('send_message', { message: text });
    }
  </script>
</body>
</html>
```

### Node.js Integration

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  socket.emit('authenticate', userId);
});

socket.on('message', (data) => {
  console.log(`${data.sender.name}: ${data.message}`);
});
```

## Troubleshooting

**Connection Refused:**
- Ensure the server is running on the correct port
- Check firewall settings

**Authentication Failed:**
- Verify the user ID is correct
- Check that the user is in an active session

**401 Unauthorized (REST API):**
- Ensure you're using a valid session cookie
- Cookie may have expired - log in again

## Additional Resources

- [API Documentation](../API.md)
- [Setup Guide](../SETUP.md)
- [Main README](../README.md)

---

**For more examples or questions, please contact the Seedbringer Collective.**
