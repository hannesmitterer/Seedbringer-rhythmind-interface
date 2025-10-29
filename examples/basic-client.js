/**
 * Example: Basic WebSocket Client
 * 
 * This example demonstrates how to connect to the Seedbringer Interface
 * and send/receive messages using Socket.IO.
 */

const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:3000');

// User information (this would come from authentication in real usage)
const userId = 'example-user-id';

// Connection established
socket.on('connect', () => {
  console.log('✓ Connected to Seedbringer Interface');
  console.log(`Socket ID: ${socket.id}`);
  
  // Authenticate the connection
  socket.emit('authenticate', userId);
  console.log('✓ Authentication request sent');
});

// Connection error
socket.on('connect_error', (error) => {
  console.error('✗ Connection error:', error.message);
});

// Disconnection
socket.on('disconnect', (reason) => {
  console.log('✗ Disconnected:', reason);
});

// Receive messages
socket.on('message', (data) => {
  console.log('\n📨 New Message:');
  console.log(`From: ${data.sender.name} (${data.sender.email})`);
  console.log(`Message: ${data.message}`);
  console.log(`Time: ${new Date(data.timestamp).toLocaleString()}`);
});

// User joined notification
socket.on('user_joined', (user) => {
  console.log(`\n👋 ${user.name} joined the channel`);
});

// User left notification
socket.on('user_left', (user) => {
  console.log(`\n👋 ${user.name} left the channel`);
});

// Example: Send a message after 2 seconds
setTimeout(() => {
  const message = 'Hello from the example client!';
  socket.emit('send_message', { message });
  console.log(`\n📤 Sent: ${message}`);
}, 2000);

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n\nClosing connection...');
  socket.close();
  process.exit();
});

console.log('Example client started. Press Ctrl+C to exit.\n');
