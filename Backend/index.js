import express from 'express';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { generalLimiter } from './middleware/ratelimiter.js';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

// IMPORTANT: Required for Render, Railway, Heroku, etc.
app.set('trust proxy', 1);

app.use(express.json());

app.use(
  cors({
    origin: "https://course-web-development.vercel.app",
    credentials: true,
  })
);

// Strip $ and . from request body/params/query to block NoSQL injection
app.use(mongoSanitize());

// Apply rate limiter
app.use(generalLimiter);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend is running successfully'
  });
});

// Routes
app.use('/', authRoutes);
app.use('/', courseRoutes);
app.use('/', userRoutes);
app.use('/', chatRoutes);

// Use Render's PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});