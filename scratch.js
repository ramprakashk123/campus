import dotenv from 'dotenv';
dotenv.config({path: './backend/.env'});
import connectDB from './backend/config/db.js';
import User from './backend/models/User.js';

const run = async () => {
  await connectDB();
  const u = await User.findOne({role: 'Student'});
  console.log(u);
  process.exit(0);
};
run();
