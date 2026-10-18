const dns = require('dns');
// Set reliable DNS servers to avoid SRV query issues on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (!MONGODB_URI) {
    console.error('❌ FATAL ERROR: MONGODB_URI environment variable is missing.');
    console.error('Please configure MONGODB_URI in your .env file or Render environment settings.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas (Database: orhims)');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
