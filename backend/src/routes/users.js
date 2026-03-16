/**
 * User / profile routes
 *
 * POST /api/users/session   - Create / restore session (returns sessionId)
 * GET  /api/users/me        - Get current user profile
 * PUT  /api/users/me        - Update display name
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users, saveStore } from '../store.js';

const router = Router();

// ─── POST /api/users/session ─────────────────────────────────────────────────
// Called on app boot — creates or restores a server-side user record.
// The frontend passes its stored sessionId so we can restore state across restarts.
router.post('/session', (req, res) => {
  const { displayName, sessionId: clientSessionId } = req.body;

  // Prefer the client's stored session ID (from localStorage) so it survives server restarts.
  // Fall back to the express-session cookie ID for first-ever visit.
  const sessionId = clientSessionId || req.session.id;

  if (!users.has(sessionId)) {
    users.set(sessionId, {
      sessionId,
      displayName: displayName || 'SeuroPay User',
      tinkUserId: null,
      externalUserId: `seuropay-${sessionId}`,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: 0,
      linkedAccounts: [],
      payments: [],
      createdAt: Date.now(),
    });
  } else if (displayName) {
    users.get(sessionId).displayName = displayName;
    saveStore();
  }

  const user = users.get(sessionId);
  res.json({
    sessionId,
    displayName: user.displayName,
    linked: !!user.accessToken,
    createdAt: user.createdAt,
  });
});

// ─── GET /api/users/me ────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  const sessionId = req.query.session || req.session.id;
  const user = users.get(sessionId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    sessionId: user.sessionId,
    displayName: user.displayName,
    externalUserId: user.externalUserId,
    linked: !!user.accessToken,
    accountCount: user.linkedAccounts.length,
    createdAt: user.createdAt,
  });
});

// ─── PUT /api/users/me ────────────────────────────────────────────────────────
router.put('/me', (req, res) => {
  const sessionId = req.session.id;
  const user = users.get(sessionId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { displayName } = req.body;
  if (displayName) user.displayName = displayName;

  res.json({ ok: true, displayName: user.displayName });
});

export default router;
