import Site from '../models/Site.js';
import { invalidateCache } from '../middleware/cache.middleware.js';

// @desc    Get all sites
// @route   GET /api/sites
// @access  Private
export const getSites = async (req, res, next) => {
  try {
    const sites = await Site.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      count: sites.length,
      data: sites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single site
// @route   GET /api/sites/:id
// @access  Private
export const getSite = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found',
      });
    }

    res.json({
      success: true,
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create site
// @route   POST /api/sites
// @access  Private (Admin only)
export const createSite = async (req, res, next) => {
  try {
    const site = await Site.create(req.body);

    // Invalider le cache
    await invalidateCache('sites:*');
    await invalidateCache('site:*');

    res.status(201).json({
      success: true,
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update site
// @route   PUT /api/sites/:id
// @access  Private (Admin only)
export const updateSite = async (req, res, next) => {
  try {
    const site = await Site.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found',
      });
    }

    // Invalider le cache
    await invalidateCache('sites:*');
    await invalidateCache('site:*');

    res.json({
      success: true,
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete site
// @route   DELETE /api/sites/:id
// @access  Private (Admin only)
export const deleteSite = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found',
      });
    }

    // Soft delete
    site.isActive = false;
    await site.save();

    // Invalider le cache
    await invalidateCache('sites:*');
    await invalidateCache('site:*');

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
