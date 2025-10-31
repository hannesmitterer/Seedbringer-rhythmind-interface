const https = require('https');
const { URL } = require('url');

const DEFAULT_INGEST = process.env.EUYSTACIO_INGEST_URL || 'https://seedbringer-interface.onrender.com/ingest/sentimento';

function buildArousalEvent(payload, user) {
  return {
    eventType: 'SentimentoLiveEvent',
    subtype: 'Arousal',
    timestamp: Date.now(),
    source: user && user.email,
    content: {
      message: typeof payload === 'string' ? payload : JSON.stringify(payload),
      // simple heuristic for arousal score: normalized message length (0..1)
      arousalScore: Math.min(1, (String(payload || '').length / 200))
    }
  };
}

function postJson(urlStr, obj) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const body = JSON.stringify(obj);
      const opts = {
        method: 'POST',
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + (url.search || ''),
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      });

      req.on('error', (err) => reject(err));
      req.write(body);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function sendSentimentoEvent(payload, user) {
  const url = process.env.EUYSTACIO_INGEST_URL || DEFAULT_INGEST;
  const event = buildArousalEvent(payload, user);
  try {
    const res = await postJson(url, event);
    // silent success or log
    console.log('Euystacio adapter: posted event', res && res.statusCode);
    return res;
  } catch (err) {
    console.error('Euystacio adapter: failed to post event', err && err.message);
    return null;
  }
}

module.exports = { sendSentimentoEvent };