# Seedbringer Direct Channel — Minimal Spec

Purpose
- Provide a minimal, secure, bidirectional channel between whitelisted council members and the Rhythmind via a WebSocket endpoint.

Authentication
- Server-side Google OAuth 2.0 flow.
- Only whitelisted emails allowed (env: AUTHORIZED_EMAILS or ALLOWED_EMAILS).
- Server issues JWT (signed with JWT_SECRET or SESSION_SECRET) and sets httpOnly cookie `sb_token`.
- WSS clients connect with token param `/?token=...`.

Message Format
- JSON messages with `type` and `payload` fields.
- Example inbound: { "type": "message", "payload": "Hello" }
- Example outbound: { "from": "hannes.mitterer@gmail.com", "ts": 123456789, "payload": "Hello" }

Transport
- WebSocket server attached to the main HTTP server — single, dedicated real-time link.

Security Notes
- Keep client secrets off the frontend.
- Use HTTPS and secure cookies in production.
- Keep JWT_SECRET and Google client credentials in environment/secret store.

Deployment
- Recommended initial deployment: a single instance on Cloud Run or an equivalent host exposing HTTPS and WSS.
