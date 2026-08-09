const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Returns current bus statuses. ETA ticks down each call to simulate live movement
// (placeholder for a real GPS feed - swap this for real tracking data later).
router.get('/', requireAuth, (req, res) => {
  const buses = db.prepare('SELECT * FROM buses').all();

  for (const bus of buses) {
    if (bus.eta_minutes > 0) {
      const newEta = Math.max(0, bus.eta_minutes - 1);
      const newStatus = newEta === 0 ? 'At campus gate' : `${newEta} min away`;
      db.prepare('UPDATE buses SET eta_minutes = ?, status = ? WHERE id = ?').run(
        newEta,
        newStatus,
        bus.id
      );
      bus.eta_minutes = newEta;
      bus.status = newStatus;
    } else {
      // reset to simulate the bus doing another loop
      const resetEta = 10 + Math.floor(Math.random() * 10);
      db.prepare('UPDATE buses SET eta_minutes = ?, status = ? WHERE id = ?').run(
        resetEta,
        `${resetEta} min away`,
        bus.id
      );
      bus.eta_minutes = resetEta;
      bus.status = `${resetEta} min away`;
    }
  }

  res.json({ buses });
});

module.exports = router;
