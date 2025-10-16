import Content from '../models/Content.js';

// @desc    Get content for a site/section
// @route   GET /api/content?siteId=xxx&section=xxx
// @access  Private
export const getContent = async (req, res, next) => {
  try {
    const { siteId, section, type } = req.query;

    const query = { isActive: true };
    if (siteId) query.site = siteId;
    if (section) query.section = section;
    if (type) query.type = type;

    const content = await Content.find(query)
      .populate('site', 'name slug')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: content.length,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single content
// @route   GET /api/content/:id
// @access  Private
export const getContentById = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id).populate('site');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create content
// @route   POST /api/content
// @access  Private
export const createContent = async (req, res, next) => {
  try {
    const content = await Content.create(req.body);

    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private
export const updateContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private
export const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
