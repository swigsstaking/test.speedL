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

router.use(protect);

router.route('/')
  .get(getSites)
  .post(authorize('admin'), createSite);

router.route('/:id')
  .get(getSite)
  .put(authorize('admin'), updateSite)
  .delete(authorize('admin'), deleteSite);

export default router;
