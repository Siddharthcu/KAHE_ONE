const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/status', requireAuth, (req, res) => {
  let status = db
    .prepare('SELECT * FROM student_status WHERE user_id = ?')
    .get(req.user.id);

  if (!status) {
    // default placeholder if not seeded for this user
    status = {
      user_id: req.user.id,
      attendance_pct: 0,
      fee_status: 'Unknown',
      library_books_due: 0
    };
  }

  res.json({ status });
});

module.exports = router;
