import mongoose from "mongoose";
import { dbConnection } from "./database.js";

const courseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  topic: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  actualPrice: {
    type: Number,
    required: true,
    min: [0, "Actual price must be a positive number"],
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: [0, "Discounted price must be a positive number"],
  },
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String, // Store username for displaying
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: [0, "Rating must be between 0 and 5"],
        max: [5, "Rating must be between 0 and 5"],
      },
      comment: {
        type: String, // Store user's comment
        default: "",
      },
    },
  ],
  purchasedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  images: {
    type: [String],
    default: [],
  },
  videos: [
    {
      title: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      thumbnail: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      videoIndex: {
        type: Number,
        required: true,
      },
      resources: [
        {
          type: String,
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  learnPoints: [
    {
      type: String,
    },
  ],
});

const Course = dbConnection.model("Course", courseSchema);
export default Course;
