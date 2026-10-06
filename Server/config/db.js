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
    
    // Fallback to local MongoDB so the development server stays alive
    try {
      console.log(`  ➜  Attempting fallback to local MongoDB (127.0.0.1:27017)...`);
      const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/inoviq', {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`  ✔  MongoDB fallback connected: ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
      return;
    } catch (fallbackErr) {
      console.error(`  ✘  Local MongoDB also unavailable.`);
    }

    console.error(`\n  💡 Fix: Make sure MongoDB is running or your IP is whitelisted on Atlas.\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
