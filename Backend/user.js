import { dbConnection} from "./database.js";
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  purchasedCourses: [{ type: String }], // Array of course IDs
});
const User = dbConnection.model('User', userSchema);
export default User;

