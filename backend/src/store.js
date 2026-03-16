/**
 * Persistent store for the demo backend.
 *
 * Users (with Tink tokens) are written to a JSON file on disk so they
 * survive server restarts. QR sessions and WS clients remain in-memory only.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_FILE = path.join(__dirname, '../../.data/users.json');

// ─── Persist users to disk ────────────────────────────────────────────────────

function loadUsers() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const obj = JSON.parse(raw);
      return new Map(Object.entries(obj));
    }
  } catch (e) {
    console.warn('[store] could not load users.json:', e.message);
  }
  return new Map();
}

function saveUsers(map) {
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    const obj = Object.fromEntries(map);
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.warn('[store] could not save users.json:', e.message);
  }
}

// Wrap Map so every set/delete also persists to disk
class PersistentMap extends Map {
  set(key, value) {
    super.set(key, value);
    saveUsers(this);
    return this;
  }
  delete(key) {
    const r = super.delete(key);
    saveUsers(this);
    return r;
  }
}

export const users = new PersistentMap(loadUsers()); // sessionId → UserRecord (persisted to disk)
export const qrSessions = new Map();                  // qrToken  → QRSession (in-memory only)
export const wsClients = new Map();                   // sessionId → WebSocket (in-memory only)

/** Call after mutating a user object in-place to persist the change */
export function saveStore() { saveUsers(users); }
