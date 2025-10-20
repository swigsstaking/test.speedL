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
import { checkSiteAccess } from '../middleware/permissions.middleware.js';

const router = express.Router();

// Routes publiques (GET)
router.get('/', getCourses);
router.get('/:id', getCourse);

// Routes protégées (POST, PUT, DELETE) avec vérification d'accès au site
router.post('/', protect, checkSiteAccess, createCourse);
router.put('/reorder', protect, checkSiteAccess, reorderCourses);
router.put('/:id', protect, checkSiteAccess, updateCourse);
router.delete('/:id', protect, checkSiteAccess, deleteCourse);

export default router;
