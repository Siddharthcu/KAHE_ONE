const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const items = db
    .prepare('SELECT * FROM announcements ORDER BY created_at DESC')
    .all();
  res.json({ items });
});

router.post('/', requireAuth, requireRole('admin', 'staff'), (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

  const result = db
    .prepare('INSERT INTO announcements (title, body, posted_by) VALUES (?, ?, ?)')
    .run(title, body, req.user.name);

  res.json({ id: result.lastInsertRowid });
});

module.exports = router;
