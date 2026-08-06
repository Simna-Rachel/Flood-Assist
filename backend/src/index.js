const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']); // MUST be above connectDB()

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hazards', require('./routes/hazardRoutes'));

app.get('/', (req, res) => {
  res.send('Flood Assist Kerala API Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});