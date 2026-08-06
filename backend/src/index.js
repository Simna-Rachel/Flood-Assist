const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Import SQLite Database
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Root Health Route
app.get('/', (req, res) => {
  res.json({ message: 'NattilAlert API is operational!' });
});

// Endpoint to save user GPS location history
app.post('/api/user/location', (req, res) => {
  const { lat, lng, email } = req.body;
  console.log(`Received location update for ${email}: ${lat}, ${lng}`);

  try {
    const stmt = db.prepare(
      'INSERT INTO user_locations (email, latitude, longitude) VALUES (?, ?, ?)'
    );
    stmt.run(email, lat, lng);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server Listen (ALWAYS keep this at the bottom)
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});