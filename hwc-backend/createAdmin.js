import mongoose from 'mongoose';
import User from './models/User.js'; // Ensure path matches your User model

const MONGO_URI = 'mongodb://127.0.0.1:27017/hwc-database';

async function createMasterAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB...');

    const username = 'admin';
    const password = 'password123'; // Change this if you prefer!
    const role = 'Admin';

    // Check if account already exists
    const existing = await User.findOne({ username });
    if (existing) {
      console.log('⚠️ Admin account already exists!');
      process.exit(0);
    }

    const newAdmin = new User({ username, password, role });
    await newAdmin.save();

    console.log('🎉 Master Admin account created successfully!');
    console.log(`➡️ Username: ${username}`);
    console.log(`➡️ Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createMasterAdmin();