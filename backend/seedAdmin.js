import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    if (adminExists) {
      console.log('Admin user already exists:');
      console.log('Email: admin@admin.com');
      console.log('Password: (previously set)');
      process.exit(0);
    }

    const user = await User.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'Admin'
    });

    console.log('Admin User Created Successfully!');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
