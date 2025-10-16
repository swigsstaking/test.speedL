import express from 'express';
import {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/content.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getContent)
  .post(createContent);

router.route('/:id')
  .get(getContentById)
  .put(updateContent)
  .delete(deleteContent);

export default router;
