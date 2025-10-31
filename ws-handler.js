const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

function setupWSS(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'change_this_secret';
      const user = jwt.verify(token, secret);
      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.user = user;
        wss.emit('connection', ws, request);
      });
    } catch (err) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    console.log('WSS: client connected', ws.user && ws.user.email);

    ws.on('message', (raw) => {
      let data;
      try { data = JSON.parse(raw.toString()); } catch (e) { return; }

      if (data && data.type === 'message') {
        const outgoing = JSON.stringify({
          from: ws.user.email,
          ts: Date.now(),
          payload: data.payload
        });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(outgoing);
        });
      }
    });

    ws.on('close', () => {
      console.log('WSS: client disconnected', ws.user && ws.user.email);
    });
  });

  console.log('WSS: initialized');
  return wss;
}

module.exports = { setupWSS };