import express from 'express';
import {
  getSEO,
  getSEOById,
  upsertSEO,
  deleteSEO,
} from '../controllers/seo.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques (GET)
router.get('/', getSEO);
router.get('/:id', getSEOById);

// Routes protégées (POST, DELETE)
router.post('/', protect, upsertSEO);
router.delete('/:id', protect, deleteSEO);

export default router;
