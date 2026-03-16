/**
 * useBackendWS — React hook for the SeuroPay real-time WebSocket connection.
 *
 * Connects on mount, registers the sessionId, keeps alive with built-in pings,
 * and dispatches typed events via onMessage callbacks.
 */

import { useEffect, useRef, useCallback } from 'react';

const WS_URL =
  (import.meta.env.VITE_WS_URL as string | undefined) ||
  (import.meta.env.DEV
    ? 'ws://localhost:4000/ws'
    : `wss://${window.location.host}/ws`);

export type WSMessage =
  | { type: 'PAYMENT_RECEIVED'; qrToken: string; amount: number; currency: string; description: string; payerDisplayName: string; paidAt: number }
  | { type: 'PAYMENT_SENT'; qrToken: string; amount: number; currency: string; description: string; payeeDisplayName: string; paidAt: number }
  | { type: 'REGISTERED'; sessionId: string }
  | { type: 'PING'; ts: number };

type MessageHandler = (msg: WSMessage) => void;

export function useBackendWS(onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMsgRef = useRef<MessageHandler>(onMessage);
  onMsgRef.current = onMessage;

  useEffect(() => {
    const sessionId = localStorage.getItem('seuropay_session_id');
    if (!sessionId) return; // not initialised yet

    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;

    function connect() {
      if (destroyed) return;
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        // Register this client under the sessionId
        ws.send(JSON.stringify({ type: 'REGISTER', sessionId }));
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data) as WSMessage;
          onMsgRef.current(msg);
        } catch {}
      };

      ws.onclose = () => {
        if (!destroyed) {
          // Reconnect after 3 s
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      destroyed = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, []);
}
