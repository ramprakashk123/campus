import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LeaveRequest from './models/LeaveRequest.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const leaves = await LeaveRequest.find({})
      .populate('user', 'name email registerNumber department role')
      .lean();
      
    console.log(JSON.stringify(leaves, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
