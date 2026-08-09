require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const canteenRoutes = require('./routes/canteen');
const announcementRoutes = require('./routes/announcements');
const busRoutes = require('./routes/bus');
const studentRoutes = require('./routes/student');

const app = express();

app.use(cors());
app.use(express.json());

// API routes - one module per feature, all sharing the same auth
app.use('/api/auth', authRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/student', studentRoutes);

// Basic health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Static frontend (plain HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kahe server running on http://localhost:${PORT}`);
  console.log('Demo logins:');
  console.log('  Student: student@college.edu / password123');
  console.log('  Staff:   staff@college.edu / password123');
  console.log('  Admin:   admin@college.edu / password123');
});
