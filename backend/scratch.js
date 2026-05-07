import dotenv from 'dotenv';
dotenv.config({path: './.env'});
import connectDB from './config/db.js';
import User from './models/User.js';

const run = async () => {
  await connectDB();
  const u = await User.find({});
  console.log(u);
  process.exit(0);
};
run();
