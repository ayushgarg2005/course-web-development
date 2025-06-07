import mongoose from 'mongoose';


// Single database connection
const dbConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/study7'); // Use signup2 or courses3

export { dbConnection };
// mongodb://127.0.0.1:27017/signup2
