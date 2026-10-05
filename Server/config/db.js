const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS resolution with mongodb+srv://
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS config error if restricted environment
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inoviq';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`  ✔  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`\n  ✘  MongoDB connection error: ${err.message}`);
    console.error(`\n  💡 Fix: Make sure MongoDB is running.`);
    console.error(`     → Run "mongod" in a terminal, or`);
    console.error(`     → Run "net start MongoDB" (if installed as service), or`);
    console.error(`     → Update MONGO_URI in Server/.env to a MongoDB Atlas URI\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
