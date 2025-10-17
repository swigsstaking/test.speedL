import express from 'express';
import {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
} from '../controllers/site.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques (GET)
router.get('/', getSites);
router.get('/:id', getSite);

// Routes protégées (POST, PUT, DELETE)
router.post('/', protect, authorize('admin'), createSite);
router.put('/:id', protect, authorize('admin'), updateSite);
router.delete('/:id', protect, authorize('admin'), deleteSite);

export default router;
