import SEO from '../models/SEO.js';

// @desc    Get SEO for a site/page
// @route   GET /api/seo?siteId=xxx&page=xxx
// @access  Private
export const getSEO = async (req, res, next) => {
  try {
    const { siteId, page } = req.query;

    const query = {};
    if (siteId) query.site = siteId;
    if (page) query.page = page;

    const seo = await SEO.find(query).populate('site', 'name slug');

    res.json({
      success: true,
      count: seo.length,
      data: seo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single SEO entry
// @route   GET /api/seo/:id
// @access  Private
export const getSEOById = async (req, res, next) => {
  try {
    const seo = await SEO.findById(req.params.id).populate('site');

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: 'SEO entry not found',
      });
    }

    res.json({
      success: true,
      data: seo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update SEO
// @route   POST /api/seo
// @access  Private
export const upsertSEO = async (req, res, next) => {
  try {
    const { site, page } = req.body;

    // Check if SEO entry exists
    let seo = await SEO.findOne({ site, page });

    if (seo) {
      // Update existing
      seo = await SEO.findByIdAndUpdate(seo._id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      // Create new
      seo = await SEO.create(req.body);
    }

    res.status(seo.isNew ? 201 : 200).json({
      success: true,
      data: seo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete SEO
// @route   DELETE /api/seo/:id
// @access  Private
export const deleteSEO = async (req, res, next) => {
  try {
    const seo = await SEO.findByIdAndDelete(req.params.id);

    if (!seo) {
      return res.status(404).json({
        success: false,
        message: 'SEO entry not found',
      });
    }

    res.json({
      success: true,
      message: 'SEO entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
