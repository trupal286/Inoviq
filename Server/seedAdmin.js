const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const User = require('./models/User');

async function seedAdmin() {
  await connectDB();

  const adminEmail = 'admin@inoviq.com';
  const adminPassword = 'AdminPassword123!';

  let admin = await User.findOne({ email: adminEmail });

  if (admin) {
    admin.password = adminPassword;
    await admin.save();
    console.log('✔ Admin password updated successfully!');
  } else {
    admin = await User.create({
      firstName: 'Admin',
      lastName: 'Inoviq',
      email: adminEmail,
      username: 'admin',
      phone: '+1 800-555-INOVIQ',
      password: adminPassword
    });
    console.log('✔ Default Admin user created successfully!');
  }

  console.log('\n=======================================');
  console.log('🔑 ADMIN LOGIN CREDENTIALS:');
  console.log('   Email / Username : admin@inoviq.com (or "admin")');
  console.log('   Password         : AdminPassword123!');
  console.log('=======================================\n');

  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('Error seeding admin user:', err);
  process.exit(1);
});
