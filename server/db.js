const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '..', 'kahe.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- student | staff | admin
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | picked_up | expired | cancelled
  qr_token TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT,
  expires_at TEXT,
  picked_up_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  price_each REAL NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  posted_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS buses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  current_position REAL NOT NULL DEFAULT 0, -- float index into bus_stops (0 = at first stop)
  minutes_per_stop REAL NOT NULL DEFAULT 3  -- used to estimate ETA between stops
);

CREATE TABLE IF NOT EXISTS bus_stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  stop_name TEXT NOT NULL,
  stop_order INTEGER NOT NULL, -- 0-indexed, last stop = campus
  FOREIGN KEY(bus_id) REFERENCES buses(id)
);

CREATE TABLE IF NOT EXISTS student_status (
  user_id INTEGER PRIMARY KEY,
  attendance_pct REAL NOT NULL,
  fee_status TEXT NOT NULL,
  library_books_due INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

// ---- Seed data (only if empty) ----
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  const pass = bcrypt.hashSync('password123', 8);
  insertUser.run('Demo Student', 'student@college.edu', pass, 'student');
  insertUser.run('Canteen Staff', 'staff@college.edu', pass, 'staff');
  insertUser.run('College Admin', 'admin@college.edu', pass, 'admin');

  const insertMenu = db.prepare(
    'INSERT INTO menu_items (name, price, available) VALUES (?, ?, 1)'
  );
  insertMenu.run('Veg Sandwich', 40);
  insertMenu.run('Masala Dosa', 50);
  insertMenu.run('Samosa (2 pcs)', 20);
  insertMenu.run('Cold Coffee', 35);
  insertMenu.run('Veg Puff', 15);
  insertMenu.run('Fried Rice', 60);

  db.prepare(
    'INSERT INTO announcements (title, body, posted_by) VALUES (?, ?, ?)'
  ).run(
    'Mid-sem exam timetable released',
    'Check the notice board / student portal for your exam schedule. Hall tickets available from Monday.',
    'Exam Cell'
  );
  db.prepare(
    'INSERT INTO announcements (title, body, posted_by) VALUES (?, ?, ?)'
  ).run(
    'Canteen new menu items',
    'Fried rice and cold coffee added to the canteen menu starting this week.',
    'Canteen Committee'
  );

  const insertBus = db.prepare(
    'INSERT INTO buses (bus_number, route_name, current_position, minutes_per_stop) VALUES (?, ?, ?, ?)'
  );
  const insertStop = db.prepare(
    'INSERT INTO bus_stops (bus_id, stop_name, stop_order) VALUES (?, ?, ?)'
  );

  function seedBus(busNumber, routeName, stops, minutesPerStop, startPosition) {
    const busId = insertBus.run(busNumber, routeName, startPosition, minutesPerStop).lastInsertRowid;
    stops.forEach((stopName, idx) => insertStop.run(busId, stopName, idx));
  }

  seedBus('#067', 'Route 1 - City Center', [
    'City Center', 'Main Market', 'Bus Stand', 'Ring Road', 'College Gate'
  ], 4, 1.3);

  seedBus('#124', 'Route 2 - Railway Station', [
    'Railway Station', 'Old Bus Stand', 'Anna Nagar', 'College Gate'
  ], 5, 3);

  seedBus('#052', 'Route 3 - Bus Stand', [
    'Central Bus Stand', 'Textile Market', 'Kumar Nagar', 'PN Road', 'College Gate'
  ], 3.5, 0.4);

  db.prepare(
    'INSERT INTO student_status (user_id, attendance_pct, fee_status, library_books_due) VALUES (1, 87.5, ?, 1)'
  ).run('Paid');
}

module.exports = db;
