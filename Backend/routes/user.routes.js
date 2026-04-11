import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// GET /profile/:userId
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courses = await Course.find({ id: { $in: user.purchasedCourses } })
      .select('id topic description actualPrice discountedPrice');

    res.json({ name: user.name, email: user.email, purchasedCourses: courses });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /purchase
router.post('/purchase', authenticate, async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ message: 'Course ID is required' });

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const course = await Course.findOne({ id: courseId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (user.purchasedCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Course already purchased' });
    }

    user.purchasedCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: 'Course purchased successfully', purchasedCourses: user.purchasedCourses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /purchased-courses
router.get('/purchased-courses', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const purchasedCourses = await Course.find({ id: { $in: user.purchasedCourses } });
    res.status(200).json({ purchasedCourses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;