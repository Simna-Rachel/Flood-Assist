const Database = require('better-sqlite3');
const path = require('path');

// Creates a local database file named 'nattilalert.db' in your backend folder
const db = new Database(path.join(__dirname, '../nattilalert.db'));

// Enable WAL mode for faster performance
db.pragma('journal_mode = WAL');

// Create tables automatically if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS user_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    latitude REAL,
    longitude REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    description TEXT NOT NULL,
    location TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'Citizen'
  );

  CREATE TABLE IF NOT EXISTS shelters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district TEXT NOT NULL,
    camp_name TEXT NOT NULL,
    contact TEXT,
    added_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
// Export the database connection so index.js can use it
module.exports = db;