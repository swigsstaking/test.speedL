import path from 'path';
import fs from 'fs/promises';

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

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
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
    const uploadsDir = './uploads';
    const files = await fs.readdir(uploadsDir);

    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);

        return {
          filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
    );

    res.json({
      success: true,
      count: fileDetails.length,
      data: fileDetails.sort((a, b) => b.createdAt - a.createdAt),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/media/:filename
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('./uploads', filename);

    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }
    next(error);
  }
};
