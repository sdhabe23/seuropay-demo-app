/**
 * P2P Payment routes
 *
 * POST /api/payments/qr/create       - Generate a QR payment session + QR PNG
 * GET  /api/payments/qr/:token       - Fetch QR session details (for scanner)
 * POST /api/payments/qr/:token/pay   - Payer confirms payment
 * POST /api/payments/transfer        - Simulate internal transfer from selected account
 * GET  /api/payments/history         - In-app payment history (SeuroPay internal)
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { users, qrSessions, saveStore } from '../store.js';
import { broadcastToSession } from '../ws/handler.js';

const router = Router();

// ─── POST /api/payments/qr/create ─────────────────────────────────────────────
router.post('/qr/create', async (req, res) => {
  try {
    const sessionId = req.query.session || req.session.id;
    const user = users.get(sessionId);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { amount, description } = req.body;
    // amount is optional — if omitted the payer will enter the amount themselves
    const parsedAmount = amount ? parseFloat(amount) : null;
    if (amount !== undefined && amount !== null && isNaN(parsedAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const qrToken = uuidv4();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // The deep-link URL that the scanner will open (or POST to)
    const payUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/scan?qr=${qrToken}`;

    // Generate real QR PNG (base64 data URI)
    const qrDataUrl = await QRCode.toDataURL(payUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1F2937', light: '#FFFFFF' },
    });

    qrSessions.set(qrToken, {
      qrToken,
      payeeSessionId: sessionId,
      payeeDisplayName: user.displayName,
      amount: parsedAmount,
      description: description || '',
      status: 'pending',
      createdAt: Date.now(),
      expiresAt,
      paidAt: null,
      payerSessionId: null,
      payerDisplayName: null,
    });

    res.json({
      qrToken,
      qrDataUrl,
      amount: parsedAmount,
      description: description || '',
      payUrl,
      expiresAt,
    });
  } catch (err) {
    console.error('[payments/qr/create]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/payments/qr/:token ──────────────────────────────────────────────
router.get('/qr/:token', (req, res) => {
  const session = qrSessions.get(req.params.token);
  if (!session) return res.status(404).json({ error: 'QR session not found' });

  if (Date.now() > session.expiresAt) {
    session.status = 'expired';
  }

  res.json({
    qrToken: session.qrToken,
    payeeDisplayName: session.payeeDisplayName,
    amount: session.amount,
    description: session.description,
    status: session.status,
    expiresAt: session.expiresAt,
  });
});

// ─── POST /api/payments/qr/:token/pay ─────────────────────────────────────────
router.post('/qr/:token/pay', (req, res) => {
  const session = qrSessions.get(req.params.token);
  if (!session) return res.status(404).json({ error: 'QR session not found' });

  const payerSessionId = req.query.session || req.session.id;
  const payer = users.get(payerSessionId);

  if (!payer) return res.status(401).json({ error: 'Not authenticated' });
  if (session.status !== 'pending') {
    return res.status(400).json({ error: `Payment already ${session.status}` });
  }
  if (Date.now() > session.expiresAt) {
    session.status = 'expired';
    return res.status(400).json({ error: 'QR code expired' });
  }
  if (payerSessionId === session.payeeSessionId) {
    return res.status(400).json({ error: 'Cannot pay yourself' });
  }

  // If session has no fixed amount, the payer must supply one
  let finalAmount = session.amount;
  if (finalAmount === null) {
    const payerAmount = req.body?.amount ? parseFloat(req.body.amount) : null;
    if (!payerAmount || isNaN(payerAmount) || payerAmount <= 0) {
      return res.status(400).json({ error: 'Amount required for open-amount QR' });
    }
    finalAmount = payerAmount;
  }

  // Mark as paid
  session.status = 'paid';
  session.paidAt = Date.now();
  session.payerSessionId = payerSessionId;
  session.payerDisplayName = payer.displayName;

  // Notify payee via WebSocket
  broadcastToSession(session.payeeSessionId, {
    type: 'PAYMENT_RECEIVED',
    qrToken: session.qrToken,
    amount: finalAmount,
    currency: 'EUR',
    description: session.description,
    payerDisplayName: payer.displayName,
    paidAt: session.paidAt,
  });

  // Notify payer (confirmation)
  broadcastToSession(payerSessionId, {
    type: 'PAYMENT_SENT',
    qrToken: session.qrToken,
    amount: finalAmount,
    currency: 'EUR',
    description: session.description,
    payeeDisplayName: session.payeeDisplayName,
    paidAt: session.paidAt,
  });

  res.json({
    ok: true,
    amount: finalAmount,
    payeeDisplayName: session.payeeDisplayName,
    description: session.description,
    paidAt: session.paidAt,
  });
});

export default router;
