/**
 * SeuroPay Backend
 *
 * Features:
 *  - Tink sandbox OAuth2 + account/transactions data
 *  - In-memory user sessions keyed by sessionId
 *  - WebSocket server for real-time P2P QR payments
 *  - QR code generation for receive links
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

import tinkRoutes from './routes/tink.js';
import paymentRoutes from './routes/payments.js';
import userRoutes from './routes/users.js';
import { wsHandler } from './ws/handler.js';

const app = express();
const server = createServer(app);

// ─── WebSocket ────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws, req) => wsHandler(ws, req, wss));

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://demo.seuropay.com',
  'http://demo.seuropay.com',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return cb(null, true);
    // Allow any localhost port (Vite picks a free port: 5173, 5174, 5175, ...)
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    // Allow the production domain
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'seuropay-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure: true in production (HTTPS)
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/tink', tinkRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 SeuroPay backend listening on http://localhost:${PORT}`);
  console.log(`   WebSocket on  ws://localhost:${PORT}/ws`);
  console.log(`   Tink sandbox  ${process.env.TINK_API_BASE}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run: kill $(lsof -ti:${PORT}) && npm start\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

export { wss };
