const dns = require('dns');
// Set reliable DNS servers to avoid SRV query issues on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdisaawel82_db_user:IcawfTu9nwxsrHrQ@cluster0.ofqp9ek.mongodb.net/orhims?retryWrites=true&w=majority&appName=Cluster0';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas (Database: orhims)');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
