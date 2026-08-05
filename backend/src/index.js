const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Root Health Route
app.get('/', (req, res) => {
  res.json({ message: 'Flood Assist API is operational!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});