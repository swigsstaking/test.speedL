import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadFile,
  getFiles,
  deleteFile,
} from '../controllers/media.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import Site from '../models/Site.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { siteId } = req.body;
      
      if (!siteId) {
        return cb(new Error('Site ID is required'));
      }

      // Récupérer le site pour obtenir le slug
      const site = await Site.findById(siteId);
      if (!site) {
        return cb(new Error('Site not found'));
      }

      // Créer le dossier uploads/{slug} s'il n'existe pas
      const baseUploadPath = process.env.UPLOAD_PATH || '/var/www/uploads';
      const siteUploadPath = path.join(baseUploadPath, site.slug);
      
      // Créer le dossier de manière récursive
      if (!fs.existsSync(siteUploadPath)) {
        fs.mkdirSync(siteUploadPath, { recursive: true });
      }

      cb(null, siteUploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images only
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter,
});

router.use(protect);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.delete('/:id', deleteFile);

export default router;
