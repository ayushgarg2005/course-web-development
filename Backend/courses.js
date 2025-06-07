import express from 'express';
import z from 'zod';
import Course from './db.js';
import User from './user-db.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // Add the import here
import axios from 'axios';
import { JWT_SECRET_KEY } from './config.js';
const app = express();
app.use(express.json());
app.use(cors());

const ratingSchema = z.object({
  userId: z.string().nonempty("User ID is required"), // Validate user ID
  username: z.string().nonempty("Username is required"), // Validate username
  rating: z
    .number()
    .min(0, { message: "Rating must be between 0 and 5" })
    .max(5, { message: "Rating must be between 0 and 5" }), // Validate rating range
  comment: z.string().optional(), // Comment is optional
});


const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string(),
  thumbnail: z.string(), // Added thumbnail field
  duration: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Duration must be in hh:mm:ss format"),
  videoIndex: z.number().int().nonnegative("Video index must be a non-negative integer"),
  resources: z.array(z.string().url()).optional(),
  createdAt: z.preprocess((val) => (val ? new Date(val) : new Date()), z.date()),
  updatedAt: z.preprocess((val) => (val ? new Date(val) : new Date()), z.date()),
});
const courseSchema = z.object({
  id: z.string().nonempty("ID is required"),
  topic: z.string().nonempty("Topic is required"),
  description: z.string().nonempty("Description is required"),
  actualPrice: z.number().min(0, "Actual price must be a positive number"),
  discountedPrice: z.number().min(0, "Discounted price must be a positive number"),
  ratings: z.array(ratingSchema).optional(),
  comments: z.array(z.string()).optional(),
  purchasedBy: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(videoSchema).optional(),
  learnPoints: z.array(z.string()).optional(),
});

const signupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});
// ------------------------------ Middleware to verify JWT -------------------------------
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token from the header
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // Verify the token
    console.log("Decoded Token:", decoded); // Debugging
    req.userId = decoded.userId;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// routes
app.post('/chat', async (req, res) => {
  const { query, context } = req.body;  // Get data from the request body
  console.log(context)
  console.log(query)
  try {
      // Make the POST request to the Ngrok URL
      const response = await axios.post('https://cbf0-34-139-156-87.ngrok-free.app/api/chat', {
          query: query,
          context: context
      });
      
      // Send the response back to the client
      res.json({
          response: response.data.response
      });
  } catch (error) {
      // Handle errors
      console.error("Error in making request to Ngrok URL:", error);
      res.status(500).json({ error: 'Failed to make request to Ngrok endpoint' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const { name, email, password } = validatedData;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the user
    const newUser = await User.create({ name, email, password });
    const token = jwt.sign({ userId: newUser._id, email }, JWT_SECRET_KEY);

    // Respond with success message and token
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: newUser._id, // Optional: Return the userId for frontend use
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --------------------------------------------Sign in route-----------------------------
app.post('/signin', async (req, res) => {
  try {
    const validatedData = signinSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email }, JWT_SECRET_KEY);
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user._id, // Include userId for frontend usage
      name: user.name, // Optionally include other user info
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
//-------------------------------- Middleware for validating request body with Zod----------
const validateCourse = (req, res, next) => {
  try {
    req.body = courseSchema.parse(req.body); // Validate and parse body
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
};
app.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user details and populate purchased courses using `id`
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Now populate courses based on their `id` (string)
    const courses = await Course.find({
      id: { $in: user.purchasedCourses }, // Find courses by the 'id' field
    }).select("id topic description actualPrice discountedPrice");

    res.json({
      name: user.name,
      email: user.email,
      purchasedCourses: courses, // Send populated course data
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// ----------------------------------------Create a course------------------------------
app.post('/courses', validateCourse, async (req, res) => {
  try {
    const newCourse = new Course(req.body); // Use validated req.body
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ------------------------------------Get all courses------------------------------
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------------------------------------Get a single course by ID------------------------
app.get('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id; // Access ID from route parameters
    console.log("Course ID received:", courseId); // Debugging line
    if (!courseId) return res.status(400).json({ message: 'Course ID is required' });

    // Find the course by its ID
    const course = await Course.findOne({ id: courseId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
app.post('/courses/review', authenticate, async (req, res) => {
  try {
    console.log("Received review request:", req.body);
    
    const { id, rating, comment, userId: userIdFromClient } = req.body; // Get userId from request body
    const userId = req.user?.id || userIdFromClient; // Prioritize authenticated user ID
    
    console.log("User ID:", userId);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const course = await Course.findOne({ id: id.toString() }); // Match by string ID
    if (!course) return res.status(404).json({ message: "Course not found" });

    console.log("Course found:", course.topic);

    // Convert `userId` to string for comparison
    const existingReviewIndex = course.ratings.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReviewIndex !== -1) {
      course.ratings[existingReviewIndex].rating = rating;
      course.ratings[existingReviewIndex].comment = comment;
    } else {
      course.ratings.push({ userId: userId.toString(), username: user.name, rating, comment });
    }

    await course.save();
    console.log("Review saved successfully!");

    res.status(200).json({ message: "Review updated successfully", ratings: course.ratings });
  } catch (err) {
    console.error("Error in review submission:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get('/courses/:courseId/feedback', async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.courseId }).populate('ratings.userId', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const feedback = course.ratings.map((rating) => ({
      username: rating.username || (rating.userId?.name ?? 'Unknown User'),
      rating: rating.rating,
      comment: rating.comment || 'No comment'
    }));

    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ------------------------------ Purchase a course -------------------------------
app.post("/purchase", authenticate, async (req, res) => {
  const { courseId } = req.body; // Extract `courseId` from the request body

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  try {
    // Fetch the user making the purchase
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the course using the `id` string field
    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the course is already purchased
    if (user.purchasedCourses.includes(courseId)) {
      return res.status(400).json({ message: "Course already purchased" });
    }

    // Add the `courseId` string to the user's purchased courses array
    user.purchasedCourses.push(courseId);

    // Save the updated user document
    await user.save();

    return res.status(200).json({
      message: "Course purchased successfully",
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});
// ---------------------- Fetch Purchased Courses ----------------------
app.get("/purchased-courses", authenticate, async (req, res) => {
  try {
    // Fetch the user and ensure they exist
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all courses that the user has purchased
    const purchasedCourses = await Course.find({ id: { $in: user.purchasedCourses } });

    // Respond with the details of the purchased courses
    res.status(200).json({ purchasedCourses });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// ------------------------------------------POST VIDEO---------------------------------------
// Add video to course
app.post("/course/:id/video", async (req, res) => {
  try {
    const { id } = req.params;
    const video = req.body;

    const course = await Course.findOne({ id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.videos.push(video);
    await course.save();

    res.status(201).json({ message: "Video added successfully", video });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete video from course
app.delete("/course/:id/video/:videoIndex", async (req, res) => {
  try {
    const { id, videoIndex } = req.params;

    const course = await Course.findOne({ id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.videos = course.videos.filter(v => v.videoIndex != videoIndex);
    await course.save();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update video in course
app.put("/courses/:id/video/:videoIndex", async (req, res) => {
  try {
    const { id, videoIndex } = req.params;
    const updatedVideo = req.body;

    const course = await Course.findOne({ id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const video = course.videos.find(v => v.videoIndex == videoIndex);
    if (!video) return res.status(404).json({ message: "Video not found" });

    Object.assign(video, updatedVideo);
    await course.save();

    res.json({ message: "Video updated successfully", video });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
// Get a video from a course by videoIndex
app.get("/course/:id/video/:videoIndex", async (req, res) => {
  try {
    const { id, videoIndex } = req.params;

    // Find the course by ID
    const course = await Course.findOne({ id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Find the video with the specified index
    const video = course.videos.find(v => v.videoIndex == videoIndex);
    if (!video) return res.status(404).json({ message: "Video not found" });

    res.json({ video });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all videos of a course
app.get("/course/:id/videos", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({ videos: course.videos });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.listen(3000,()=>{
  console.log("listening on port")
});
