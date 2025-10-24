import express from 'express';
import {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  updateSitePages,
  updateSiteSections,
} from '../controllers/site.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';
import { checkSiteAccess } from '../middleware/permissions.middleware.js';

const router = express.Router();

// Routes publiques (GET) avec cache
router.get('/', cacheMiddleware('sites', 3600), getSites);
router.get('/:id', cacheMiddleware('site', 3600), getSite);

// Routes protégées (POST, PUT, DELETE)
router.post('/', protect, authorize('admin'), createSite);
router.put('/:id', protect, authorize('admin'), updateSite);
router.delete('/:id', protect, authorize('admin'), deleteSite);

// Routes pour gérer les pages et sections (accessible aux editors du site)
router.put('/:id/pages', protect, checkSiteAccess, updateSitePages);
router.put('/:id/sections', protect, checkSiteAccess, updateSiteSections);

export default router;
