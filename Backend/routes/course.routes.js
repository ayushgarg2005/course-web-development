import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateCourse from '../middleware/validateCourse.js';

const router = express.Router();

const getCourseQuery = (idParam) => {
  if (!idParam) return { _id: null };
  const cleanId = idParam.toString().trim();
  const escapedId = cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);

  const orConditions = [
    { id: cleanId },
    { id: { $regex: new RegExp(`^\\s*${escapedId}\\s*$`, 'i') } }
  ];

  if (isObjectId) {
    orConditions.push({ _id: cleanId });
  }

  return { $or: orConditions };
};

// ── Course Base Routes ──────────────────────────────────────────

router.post('/courses', authenticate, authorize('admin'), validateCourse, async (req, res) => {
  try {
    if (req.body && req.body.id) {
      req.body.id = req.body.id.toString().trim();
    }
    const newCourse = new Course({ ...req.body, createdBy: req.userId });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /courses — get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /courses/:id — get single course
router.get('/courses/:id', async (req, res) => {
  try {
    const query = getCourseQuery(req.params.id);
    const course = await Course.findOne(query);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// PUT /courses/:id — update a course (Admin only, Creator only)
router.put('/courses/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (req.body && req.body.id) {
      req.body.id = req.body.id.toString().trim();
    }
    const query = getCourseQuery(req.params.id);
    let course = await Course.findOne(query);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Ownership check
    if (course.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Only the creator can update this course' });
    }

    const { _id, __v, createdBy, ...updateData } = req.body; // Prevent internal ID/creator updates

    course = await Course.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );
    res.status(200).json(course);
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// DELETE /courses/:id — delete a course (Admin only, Creator only)
router.delete('/courses/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const query = getCourseQuery(req.params.id);
    const course = await Course.findOne(query);

    if (!course) {
      return res.status(404).json({ message: `Course with ID ${req.params.id} not found` });
    }

    // Ownership check
    if (course.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Only the creator can delete this course' });
    }

    await Course.findOneAndDelete(query);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ── Review & Feedback ───────────────────────────────────────────

// POST /courses/review — submit or update a review
router.post('/courses/review', authenticate, async (req, res) => {
  try {
    const { id, rating, comment, userId: userIdFromClient } = req.body;
    const userId = req.userId || userIdFromClient;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existingIndex = course.ratings.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingIndex !== -1) {
      course.ratings[existingIndex].rating = rating;
      course.ratings[existingIndex].comment = comment;
    } else {
      course.ratings.push({ userId: userId.toString(), username: user.name, rating, comment });
    }

    await course.save();
    res.status(200).json({ message: 'Review updated successfully', ratings: course.ratings });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /courses/:courseId/feedback
router.get('/courses/:courseId/feedback', async (req, res) => {
  try {
    const course = await Course.findOne(getCourseQuery(req.params.courseId))
      .populate('ratings.userId', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const feedback = course.ratings.map((r) => ({
      username: r.username || r.userId?.name || 'Unknown User',
      rating: r.rating,
      comment: r.comment || 'No comment',
    }));

    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ── Video routes (Standardized to /courses) ─────────────────────

// POST /courses/:id/video
router.post('/courses/:id/video', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findOne(getCourseQuery(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.videos.push(req.body);
    await course.save();
    res.status(201).json({ message: 'Video added successfully', video: req.body });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /courses/:id/videos
router.get('/courses/:id/videos', async (req, res) => {
  try {
    const course = await Course.findOne(getCourseQuery(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ videos: course.videos });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /courses/:id/video/:videoIndex
router.get('/courses/:id/video/:videoIndex', async (req, res) => {
  try {
    const course = await Course.findOne(getCourseQuery(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const video = course.videos.find((v) => v.videoIndex == req.params.videoIndex);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    res.json({ video });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PUT /courses/:id/video/:videoIndex
router.put('/courses/:id/video/:videoIndex', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findOne(getCourseQuery(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const video = course.videos.find((v) => v.videoIndex == req.params.videoIndex);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    Object.assign(video, req.body);
    await course.save();
    res.json({ message: 'Video updated successfully', video });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE /courses/:id/video/:videoIndex
router.delete('/courses/:id/video/:videoIndex', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findOne(getCourseQuery(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.videos = course.videos.filter((v) => v.videoIndex != req.params.videoIndex);
    await course.save();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;