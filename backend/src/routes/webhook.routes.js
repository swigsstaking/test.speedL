import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { rebuildSite, getRebuildStatus } from '../controllers/webhook.controller.js';

const router = express.Router();

// Déclencher le rebuild (protégé - admin seulement)
router.post('/rebuild', protect, rebuildSite);

// Obtenir le statut du rebuild
router.get('/rebuild/status', protect, getRebuildStatus);

export default router;
