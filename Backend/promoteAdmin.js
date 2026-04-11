import mongoose from 'mongoose';
import User from './models/User.js';
import { dbConnection } from './database.js';

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.error('Please provide an email as an argument');
  process.exit(1);
}

dbConnection.on('open', async () => {
  try {
    const user = await User.findOneAndUpdate(
      { email: emailToPromote },
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      console.log(`User with email ${emailToPromote} not found`);
    } else {
      console.log(`User ${user.email} promoted to admin`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
