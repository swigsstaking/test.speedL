import express from 'express';
import {
  getSEO,
  getSEOById,
  upsertSEO,
  deleteSEO,
} from '../controllers/seo.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSEO)
  .post(upsertSEO);

router.route('/:id')
  .get(getSEOById)
  .delete(deleteSEO);

export default router;
