/**
 * Example: REST API Usage
 * 
 * This example demonstrates how to use the REST API endpoints
 * with proper authentication.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Example: Get current user (requires authentication)
async function getCurrentUser(sessionCookie) {
  try {
    const response = await axios.get(`${BASE_URL}/api/user`, {
      headers: {
        Cookie: sessionCookie
      }
    });
    
    console.log('Current User:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.user;
  } catch (error) {
    console.error('Error getting user:', error.response?.data || error.message);
  }
}

// Example: Get active sessions
async function getActiveSessions(sessionCookie) {
  try {
    const response = await axios.get(`${BASE_URL}/api/sessions`, {
      headers: {
        Cookie: sessionCookie
      }
    });
    
    console.log('\nActive Sessions:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.sessions;
  } catch (error) {
    console.error('Error getting sessions:', error.response?.data || error.message);
  }
}

// Example: Broadcast a message
async function broadcastMessage(sessionCookie, message) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/broadcast`,
      { message },
      {
        headers: {
          Cookie: sessionCookie,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\nMessage Broadcasted:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error broadcasting message:', error.response?.data || error.message);
  }
}

// Example: Logout
async function logout(sessionCookie) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/logout`,
      {},
      {
        headers: {
          Cookie: sessionCookie
        }
      }
    );
    
    console.log('\nLogout Success:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error.response?.data || error.message);
  }
}

// Example usage
async function runExamples() {
  // NOTE: In a real scenario, you would obtain the session cookie
  // by authenticating through the browser first
  const sessionCookie = 'connect.sid=YOUR_SESSION_COOKIE_HERE';
  
  console.log('=== Seedbringer API Examples ===\n');
  
  // Get current user
  await getCurrentUser(sessionCookie);
  
  // Get active sessions
  await getActiveSessions(sessionCookie);
  
  // Broadcast a message
  await broadcastMessage(sessionCookie, 'Hello from the API example!');
  
  // Note: Uncomment to test logout
  // await logout(sessionCookie);
}

// Run if executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  getCurrentUser,
  getActiveSessions,
  broadcastMessage,
  logout
};
