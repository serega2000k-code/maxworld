'use strict';
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL is used when DATABASE_URL is configured. A small in-memory fallback
// keeps local preview usable, but it resets whenever the process restarts.
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false } });
}
const memory = new Map();
const catalog = [
  { id: 'lamp', name: 'Вуличний ліхтар', price: 25, emoji: '💡', type: 'decor' },
  { id: 'tree', name: 'Дерево', price: 35, emoji: '🌳', type: 'decor' },
  { id: 'bench', name: 'Лавка', price: 50, emoji: '🪑', type: 'decor' },
  { id: 'flower', name: 'Квітка', price: 15, emoji: '🌼', type: 'decor' },
  { id: 'wall', name: 'Стіна будинку', price: 40, emoji: '🧱', type: 'build' },
  { id: 'window', name: 'Вікно', price: 30, emoji: '🪟', type: 'build' },
  { id: 'door', name: 'Двері', price: 45, emoji: '🚪', type: 'build' },
  { id: 'roof', name: 'Дах', price: 60, emoji: '🏠', type: 'build' }
];
function freshPlayer() { return { coins: 100, inventory: {}, house: [], x: 50, y: 50, createdAt: new Date().toISOString() }; }
async function initDb() {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS maxworld_players (
    player_id TEXT PRIMARY KEY, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS maxworld_presence (
    player_id TEXT PRIMARY KEY, display_name TEXT NOT NULL, x DOUBLE PRECISION NOT NULL DEFAULT 50,
    y DOUBLE PRECISION NOT NULL DEFAULT 50, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
}
async function getPlayer(id) {
  if (pool) {
    const r = await pool.query('SELECT state FROM maxworld_players WHERE player_id=$1', [id]);
    if (r.rows[0]) return r.rows[0].state;
    const p = freshPlayer(); await savePlayer(id, p); return p;
  }
  if (!memory.has(id)) memory.set(id, freshPlayer());
  return memory.get(id);
}
async function savePlayer(id, state) {
  if (pool) await pool.query(`INSERT INTO maxworld_players(player_id,state,updated_at) VALUES($1,$2,NOW())
    ON CONFLICT(player_id) DO UPDATE SET state=EXCLUDED.state, updated_at=NOW()`, [id, state]);
  else memory.set(id, state);
}
function playerId(req) {
  let id = String(req.headers['x-player-id'] || req.body?.playerId || req.query.playerId || '');
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(id)) id = crypto.randomUUID();
  return id;
}
// Multiplayer presence: active players are visible to each other.
const presenceMemory = new Map();
async function touchPresence(id, state, displayName) {
  const name = String(displayName || ('Гравець-' + id.slice(0, 4))).trim().slice(0, 24) || ('Гравець-' + id.slice(0, 4));
  if (pool) {
    await pool.query(`INSERT INTO maxworld_presence(player_id,display_name,x,y,updated_at)
      VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(player_id) DO UPDATE SET
      display_name=EXCLUDED.display_name,x=EXCLUDED.x,y=EXCLUDED.y,updated_at=NOW()`,
      [id, name, state.x, state.y]);
  } else {
    presenceMemory.set(id, { playerId: id, name, x: state.x, y: state.y, updatedAt: Date.now() });
  }
}
app.get('/api/health', async (_req, res) => res.json({ ok: true, game: 'MAXWORLD', multiplayer: true, storage: pool ? 'postgresql' : 'memory-fallback' }));
app.post('/api/presence', async (req, res, next) => {
  try { const id = playerId(req); const state = await getPlayer(id); await touchPresence(id, state, req.body.name); res.json({ playerId: id, online: true }); }
  catch(e) { next(e); }
});
app.get('/api/world', async (req, res, next) => {
  try {
    const id = playerId(req); let players;
    if (pool) {
      const r = await pool.query(`SELECT player_id AS "playerId",display_name AS name,x,y FROM maxworld_presence
        WHERE updated_at > NOW() - INTERVAL '45 seconds' AND player_id <> $1`, [id]);
      players = r.rows;
      await pool.query(`DELETE FROM maxworld_presence WHERE updated_at < NOW() - INTERVAL '10 minutes'`);
    } else {
      const cutoff = Date.now() - 45000;
      for (const [pid, p] of presenceMemory) if (p.updatedAt < cutoff) presenceMemory.delete(pid);
      players = [...presenceMemory.values()].filter(p => p.playerId !== id).map(({playerId,name,x,y}) => ({playerId,name,x,y}));
    }
    res.json({ players });
  } catch(e) { next(e); }
});
app.get('/api/state', async (req, res, next) => {
  try { const id = playerId(req); const state = await getPlayer(id); res.json({ playerId: id, state, catalog }); } catch(e) { next(e); }
});
app.post('/api/collect', async (req, res, next) => {
  try {
    const id = playerId(req); const p = await getPlayer(id);
    const amount = Math.max(1, Math.min(10, Number(req.body.amount) || 5));
    p.coins += amount; await savePlayer(id, p); res.json({ playerId: id, state: p, collected: amount });
  } catch(e) { next(e); }
});
app.post('/api/buy', async (req, res, next) => {
  try {
    const id = playerId(req); const p = await getPlayer(id);
    const item = catalog.find(x => x.id === String(req.body.itemId));
    if (!item) return res.status(404).json({ error: 'Предмет не знайдено' });
    if (p.coins < item.price) return res.status(400).json({ error: 'Недостатньо монет' });
    p.coins -= item.price; p.inventory[item.id] = (p.inventory[item.id] || 0) + 1;
    await savePlayer(id, p); res.json({ playerId: id, state: p, message: `Придбано: ${item.name}` });
  } catch(e) { next(e); }
});
app.post('/api/build', async (req, res, next) => {
  try {
    const id = playerId(req); const p = await getPlayer(id);
    const itemId = String(req.body.itemId || ''); const item = catalog.find(x => x.id === itemId && x.type === 'build');
    if (!item) return res.status(400).json({ error: 'Оберіть будівельний предмет у магазині' });
    if (!(p.inventory[itemId] > 0)) return res.status(400).json({ error: 'Спочатку придбайте цей предмет' });
    p.inventory[itemId]--; p.house.push({ id: crypto.randomUUID(), itemId, name: item.name, emoji: item.emoji,
      x: Math.max(5, Math.min(90, Number(req.body.x) || 50)), y: Math.max(5, Math.min(90, Number(req.body.y) || 50)) });
    await savePlayer(id, p); res.json({ playerId: id, state: p, message: `${item.name} додано до будинку` });
  } catch(e) { next(e); }
});
app.post('/api/move', async (req, res, next) => {
  try { const id = playerId(req); const p = await getPlayer(id); p.x = Math.max(2, Math.min(98, Number(req.body.x) || p.x)); p.y = Math.max(2, Math.min(98, Number(req.body.y) || p.y)); await savePlayer(id,p); await touchPresence(id,p,req.body.name); res.json({ playerId:id,state:p }); }
  catch(e) { next(e); }
});
app.get('/api/ads', (_req, res) => res.json({ enabled: process.env.ADS_ENABLED === 'true', provider: process.env.ADS_PROVIDER || 'placeholder' }));
app.use((err, _req, res, _next) => { console.error('MAXWORLD API error:', err); res.status(500).json({ error: 'Помилка сервера. Спробуйте ще раз.' }); });
initDb().then(() => app.listen(PORT, () => console.log(`MAXWORLD listening on ${PORT}; database=${pool ? 'PostgreSQL' : 'memory fallback'}`)))
  .catch(err => { console.error('Database initialization failed:', err); process.exit(1); });
