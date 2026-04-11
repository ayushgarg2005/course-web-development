import mongoose from 'mongoose';
import { dbConnection } from '../database.js';

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  purchasedCourses: [{ type: String }],
  refreshToken:     { type: String, default: null },
  role:             { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = dbConnection.model('User', userSchema);
export default User;