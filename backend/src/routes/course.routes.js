import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses,
} from '../controllers/course.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques (GET)
router.get('/', getCourses);
router.get('/:id', getCourse);

// Routes protégées (POST, PUT, DELETE)
router.post('/', protect, createCourse);
router.put('/reorder', protect, reorderCourses);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

export default router;
