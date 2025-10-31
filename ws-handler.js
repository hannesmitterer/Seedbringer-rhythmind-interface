const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { sendSentimentoEvent } = require('./adapters/euystacio-adapter'); // adapter integration

// Hardening configuration (can be tuned via env vars)
const RATE_LIMIT_COUNT = parseInt(process.env.RATE_LIMIT_COUNT || '30', 10); // messages per WINDOW_MS
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(60 * 1000), 10); // time window in ms
const MAX_BROADCAST = parseInt(process.env.MAX_BROADCAST || '50', 10); // max recipients per message
const AUDIT_MAX_ENTRIES = parseInt(process.env.AUDIT_MAX_ENTRIES || '200', 10);
const AUDIT_DIR = process.env.AUDIT_DIR || path.join(__dirname, '..', 'audit');
const AUDIT_FILE = process.env.AUDIT_FILE || path.join(AUDIT_DIR, 'audit.log');

// in-memory retention buffer (short retention)
const auditBuffer = [];

// ensure audit directory exists
try { fs.mkdirSync(AUDIT_DIR, { recursive: true }); } catch (e) { /* ignore */ }

function appendAudit(entry) {
  try {
    const line = JSON.stringify(entry) + '\n';
    // append to file (async)
    fs.appendFile(AUDIT_FILE, line, (err) => {
      if (err) console.error('Audit append failed', err && err.message);
    });
    // keep short in-memory buffer
    auditBuffer.push(entry);
    if (auditBuffer.length > AUDIT_MAX_ENTRIES) auditBuffer.shift();
  } catch (e) {
    console.error('appendAudit error', e && e.message);
  }
}

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
        // initialize simple rate-limit tracking per socket
        ws._rl = { count: 0, windowStart: Date.now() };
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

      // rate-limiting per socket (simple sliding window)
      const now = Date.now();
      if (now - ws._rl.windowStart > WINDOW_MS) {
        ws._rl.windowStart = now;
        ws._rl.count = 0;
      }
      ws._rl.count += 1;
      if (ws._rl.count > RATE_LIMIT_COUNT) {
        // notify and drop
        try { ws.send(JSON.stringify({ type: 'error', message: 'rate_limit_exceeded' })); } catch (e) {}
        return;
      }

      if (data && data.type === 'message') {
        const outgoingObj = {
          from: ws.user.email,
          ts: Date.now(),
          payload: data.payload
        };
        const outgoing = JSON.stringify(outgoingObj);

        // Broadcast to a limited set of authenticated clients (exclude sender)
        const recipients = Array.from(wss.clients).filter((client) => client.readyState === WebSocket.OPEN && client !== ws);
        const sliced = recipients.slice(0, MAX_BROADCAST);
        sliced.forEach((client) => {
          try { client.send(outgoing); } catch (e) { /* ignore individual send errors */ }
        });

        // Audit the message (truncate payload to keep retention short)
        const auditEntry = {
          ts: Date.now(),
          from: ws.user.email,
          type: 'message',
          payload_preview: (typeof data.payload === 'string') ? data.payload.slice(0, 200) : JSON.stringify(data.payload).slice(0, 200)
        };
        appendAudit(auditEntry);

        // Forward to Euystacio GGI ingest asynchronously (fire-and-forget)
        try {
          sendSentimentoEvent(data.payload, ws.user)
            .then((res) => {
              if (!res || (res.statusCode && res.statusCode >= 400)) {
                console.warn('Euystacio adapter returned non-OK response', res && res.statusCode);
                appendAudit({ ts: Date.now(), from: ws.user.email, type: 'euystacio_post_error', status: res && res.statusCode });
              } else {
                appendAudit({ ts: Date.now(), from: ws.user.email, type: 'euystacio_post_ok', status: res && res.statusCode });
              }
            })
            .catch((err) => {
              console.error('Euystacio adapter error', err && err.message);
              appendAudit({ ts: Date.now(), from: ws.user.email, type: 'euystacio_post_error', error: err && err.message });
            });
        } catch (err) {
          console.error('Failed to trigger Euystacio adapter', err && err.message);
          appendAudit({ ts: Date.now(), from: ws.user.email, type: 'euystacio_post_error', error: err && err.message });
        }
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
