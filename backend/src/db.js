const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 🔥 HARDCODED URI - Remove this later and use env
    const mongoURI = 'mongodb+srv://swathiaajith_db_user:XtPDkGZFKrKojEpK@cluster0.9eslwib.mongodb.net/flood_assist?retryWrites=true&w=majority&appName=Cluster0';
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;