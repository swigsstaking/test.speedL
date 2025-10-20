import express from 'express';
import {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/content.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkSiteAccess } from '../middleware/permissions.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getContent)
  .post(protect, checkSiteAccess, createContent);

router.route('/:id')
  .get(getContentById)
  .put(protect, checkSiteAccess, updateContent)
  .delete(protect, checkSiteAccess, deleteContent);

export default router;
