import z from 'zod';
import { courseSchema } from '../schemas/zodschemas.js';

const validateCourse = (req, res, next) => {
  try {
    req.body = courseSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
};

export default validateCourse;