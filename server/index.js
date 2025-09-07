require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'data.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';
const PORT = process.env.PORT || 4000;

// ensure DB and schema
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, '');
}
const db = new sqlite3.Database(DB_PATH);
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// helper: authenticate
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  const token = auth && auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hash = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`, [email, hash, name || null], function(err) {
    if (err) return res.status(400).json({ error: 'Email already used' });
    const user = { id: this.lastID, email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    // create empty cart row
    db.run(`INSERT OR IGNORE INTO carts (user_id, items_json) VALUES (?, ?)`, [this.lastID, '[]']);
    res.json({ token, user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  db.get(`SELECT id, email, password_hash, name FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) return res.status(400).json({ error: 'invalid credentials' });
    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) return res.status(400).json({ error: 'invalid credentials' });
    const user = { id: row.id, email: row.email, name: row.name };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });
});

// ITEMS CRUD
// GET /api/items?category=...&minPrice=...&maxPrice=...&q=...&limit=&offset=
app.get('/api/items', (req, res) => {
  const { category, minPrice, maxPrice, q, limit = 50, offset = 0 } = req.query;
  let sql = `SELECT * FROM items WHERE 1=1`;
  const params = [];
  if (category) { sql += ` AND category = ?`; params.push(category); }
  if (minPrice) { sql += ` AND price >= ?`; params.push(Number(minPrice)); }
  if (maxPrice) { sql += ` AND price <= ?`; params.push(Number(maxPrice)); }
  if (q) { sql += ` AND (title LIKE ? OR description LIKE ?)`; params.push('%' + q + '%', '%'+ q + '%'); }
  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// Admin-style endpoints for create/update/delete (no auth for brevity — add admin check in prod)
app.post('/api/items', (req, res) => {
  const { title, description, price, category, image } = req.body;
  if (!title || price == null) return res.status(400).json({ error: 'title & price required' });
  db.run(`INSERT INTO items (title, description, price, category, image) VALUES (?, ?, ?, ?, ?)`, [title, description||'', price, category||'', image||''], function(err) {
    if (err) return res.status(500).json({ error: 'db error' });
    db.get(`SELECT * FROM items WHERE id = ?`, [this.lastID], (e, row) => res.json(row));
  });
});

app.put('/api/items/:id', (req, res) => {
  const id = req.params.id;
  const { title, description, price, category, image } = req.body;
  db.run(`UPDATE items SET title=?, description=?, price=?, category=?, image=? WHERE id=?`, [title, description||'', price, category||'', image||'', id], function(err) {
    if (err) return res.status(500).json({ error: 'db error' });
    db.get(`SELECT * FROM items WHERE id = ?`, [id], (e, row) => res.json(row));
  });
});

app.delete('/api/items/:id', (req, res) => {
  db.run(`DELETE FROM items WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ success: true });
  });
});

// CART APIs (requires auth)
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.get(`SELECT items_json FROM carts WHERE user_id = ?`, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) {
      db.run(`INSERT INTO carts (user_id, items_json) VALUES (?, ?)`, [userId, '[]']);
      return res.json([]);
    }
    try {
      const items = JSON.parse(row.items_json || '[]');
      res.json(items);
    } catch (e) { res.json([]); }
  });
});

// Replace cart entirely (frontend can sync local cart after login)
app.put('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const items = req.body.items || [];
  db.run(`INSERT INTO carts (user_id, items_json) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET items_json = excluded.items_json`, [userId, JSON.stringify(items)], function(err) {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json({ success: true });
  });
});

// Add single item (or increment quantity if exists)
app.post('/api/cart/add', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { itemId, qty = 1 } = req.body;
  db.get(`SELECT items_json FROM carts WHERE user_id = ?`, [userId], (err, row) => {
    let items = [];
    if (row && row.items_json) {
      try { items = JSON.parse(row.items_json); } catch(e){ items = []; }
    }
    // find
    const found = items.find(i => i.itemId === itemId);
    if (found) found.qty = (found.qty || 0) + Number(qty);
    else items.push({ itemId, qty: Number(qty) });
    db.run(`INSERT INTO carts (user_id, items_json) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET items_json = excluded.items_json`, [userId, JSON.stringify(items)], function(err2) {
      if (err2) return res.status(500).json({ error: 'db error' });
      res.json(items);
    });
  });
});

// Remove item or set qty
app.post('/api/cart/remove', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.body;
  db.get(`SELECT items_json FROM carts WHERE user_id = ?`, [userId], (err, row) => {
    let items = [];
    if (row && row.items_json) {
      try { items = JSON.parse(row.items_json); } catch(e){ items = []; }
    }
    items = items.filter(i => i.itemId !== itemId);
    db.run(`INSERT INTO carts (user_id, items_json) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET items_json = excluded.items_json`, [userId, JSON.stringify(items)], function(err2) {
      if (err2) return res.status(500).json({ error: 'db error' });
      res.json(items);
    });
  });
});

// Simple health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
