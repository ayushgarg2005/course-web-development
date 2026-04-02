import z from 'zod';

export const signupSchema = z.object({
  name:     z.string().min(1, { message: 'Name is required' }),
  email:    z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const signinSchema = z.object({
  email:    z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const ratingSchema = z.object({
  userId:   z.string().nonempty('User ID is required'),
  username: z.string().nonempty('Username is required'),
  rating:   z.number().min(0).max(5, { message: 'Rating must be between 0 and 5' }),
  comment:  z.string().optional(),
});

export const videoSchema = z.object({
  title:      z.string().min(1, 'Title is required'),
  url:        z.string(),
  thumbnail:  z.string(),
  duration:   z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Duration must be in hh:mm:ss format'),
  videoIndex: z.number().int().nonnegative('Video index must be a non-negative integer'),
  resources:  z.array(z.string().url()).optional(),
  createdAt:  z.preprocess((val) => (val ? new Date(val) : new Date()), z.date()),
  updatedAt:  z.preprocess((val) => (val ? new Date(val) : new Date()), z.date()),
});

export const courseSchema = z.object({
  id:              z.string().nonempty('ID is required'),
  topic:           z.string().nonempty('Topic is required'),
  description:     z.string().nonempty('Description is required'),
  actualPrice:     z.number().min(0, 'Actual price must be a positive number'),
  discountedPrice: z.number().min(0, 'Discounted price must be a positive number'),
  ratings:         z.array(ratingSchema).optional(),
  comments:        z.array(z.string()).optional(),
  purchasedBy:     z.array(z.string()).optional(),
  images:          z.array(z.string()).optional(),
  videos:          z.array(videoSchema).optional(),
  learnPoints:     z.array(z.string()).optional(),
});