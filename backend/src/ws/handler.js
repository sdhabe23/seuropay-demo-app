/**
 * WebSocket handler
 *
 * Each client sends { type: 'REGISTER', sessionId: '...' } on connect.
 * The server registers that WS connection under the sessionId so we can
 * push payment events to specific users.
 *
 * Message types (server → client):
 *   PAYMENT_RECEIVED  - payee gets notified when their QR is scanned + paid
 *   PAYMENT_SENT      - payer gets notified after payment is confirmed
 *   PING              - keepalive
 */

import { wsClients } from '../store.js';

/** Register a WS client under a sessionId. */
function registerClient(sessionId, ws) {
  // Close any existing connection for this session
  const existing = wsClients.get(sessionId);
  if (existing && existing.readyState === 1 /* OPEN */) {
    try { existing.close(); } catch (_) {}
  }
  wsClients.set(sessionId, ws);
  ws._sessionId = sessionId;
}

/** Send a JSON message to a specific sessionId's WS, if connected. */
export function broadcastToSession(sessionId, payload) {
  const ws = wsClients.get(sessionId);
  if (ws && ws.readyState === 1 /* WebSocket.OPEN */) {
    ws.send(JSON.stringify(payload));
    return true;
  }
  return false;
}

/** Main connection handler attached to the WebSocketServer. */
export function wsHandler(ws, req, wss) {
  console.log(`[ws] New connection from ${req.socket.remoteAddress}`);

  // Keepalive ping every 25 s
  const pingInterval = setInterval(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'PING', ts: Date.now() }));
    }
  }, 25_000);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'REGISTER' && msg.sessionId) {
      registerClient(msg.sessionId, ws);
      ws.send(JSON.stringify({ type: 'REGISTERED', sessionId: msg.sessionId }));
      console.log(`[ws] Registered session ${msg.sessionId}`);
    }
  });

  ws.on('close', () => {
    clearInterval(pingInterval);
    if (ws._sessionId) {
      // Only remove if this is still the current connection for that session
      if (wsClients.get(ws._sessionId) === ws) {
        wsClients.delete(ws._sessionId);
      }
    }
    console.log(`[ws] Connection closed${ws._sessionId ? ` (session ${ws._sessionId})` : ''}`);
  });

  ws.on('error', (err) => {
    console.error('[ws] Error:', err.message);
  });
}
