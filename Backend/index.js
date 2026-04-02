import express from 'express';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { generalLimiter } from './middleware/ratelimiter.js';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();
app.use(express.json());
app.use(cors());

// Strip $ and . from request body/params/query to block NoSQL injection
// e.g. { "email": { "$gt": "" } } gets sanitized before hitting MongoDB
app.use(mongoSanitize());

// Apply general rate limit to all routes
app.use(generalLimiter);

app.use('/', authRoutes);
app.use('/', courseRoutes);
app.use('/', userRoutes);
app.use('/', chatRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));