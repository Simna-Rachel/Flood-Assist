const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']); // MUST be above connectDB()

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();

// Fail fast instead of silently creating broken accounts (a missing/blank
// JWT_SECRET used to let register() save a user to the DB and THEN crash
// when signing the token, leaving a phantom account behind).
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing from backend/.env — refusing to start. Check that .env is saved as UTF-8, not UTF-16.');
  process.exit(1);
}

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serves uploaded hazard-report photos, e.g. GET /uploads/169...-photo.jpg
// Must come before the API routes so static files aren't shadowed.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hazards', require('./routes/hazardRoutes'));
app.use('/api/shelters', require('./routes/shelterRoutes')); // ← ADD THIS
app.use('/api/user', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.send('Flood Assist Kerala API Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});