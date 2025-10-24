import path from 'path';
import fs from 'fs/promises';
import Media from '../models/Media.js';
import Site from '../models/Site.js';

// @desc    Upload file
// @route   POST /api/media/upload
// @access  Private
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const { siteId } = req.body;
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'Site ID is required',
      });
    }

    // Vérifier que le site existe
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found',
      });
    }

    // Construire l'URL du fichier
    const publicUrl = process.env.PUBLIC_URL;
    let fileUrl;
    
    if (publicUrl) {
      fileUrl = `${publicUrl}/uploads/${site.slug}/${req.file.filename}`;
    } else {
      const protocol = req.protocol;
      const host = req.get('host');
      fileUrl = `${protocol}://${host}/uploads/${site.slug}/${req.file.filename}`;
    }

    // Créer l'entrée dans MongoDB
    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      siteId,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      url: fileUrl,
      data: media,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all uploaded files
// @route   GET /api/media
// @access  Private
export const getFiles = async (req, res, next) => {
  try {
    const { siteId } = req.query;
    
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'Site ID is required',
      });
    }

    // Récupérer les médias depuis MongoDB filtrés par site
    const media = await Media.find({ siteId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/media/:id
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupérer le média depuis MongoDB
    const media = await Media.findById(id).populate('siteId');
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found',
      });
    }

    // Construire le chemin du fichier
    const uploadsDir = process.env.UPLOAD_PATH || '/var/www/uploads';
    const filePath = path.join(uploadsDir, media.siteId.slug, media.filename);

    // Supprimer le fichier du disque
    try {
      await fs.unlink(filePath);
    } catch (fsError) {
      console.error('Error deleting file from disk:', fsError);
      // Continue même si le fichier n'existe pas sur le disque
    }

    // Supprimer l'entrée MongoDB
    await Media.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
