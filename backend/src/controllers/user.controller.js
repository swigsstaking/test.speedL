import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Récupérer tous les utilisateurs (admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('sites', 'name slug domain')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un utilisateur par ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('sites', 'name slug domain');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouvel utilisateur (admin only)
 */
export const createUser = async (req, res, next) => {
  try {
    const { email, password, name, role, sites } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'editor',
      sites: sites || [],
    });
    
    // Retourner sans le mot de passe
    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('sites', 'name slug domain');
    
    logger.success(`Utilisateur créé: ${email} (${role})`);
    
    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un utilisateur
 */
export const updateUser = async (req, res, next) => {
  try {
    const { email, name, role, sites, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }
    
    // Mettre à jour les champs
    if (email) user.email = email;
    if (name) user.name = name;
    if (role && req.user.role === 'admin') user.role = role; // Seul admin peut changer le rôle
    if (sites !== undefined && req.user.role === 'admin') user.sites = sites;
    if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;
    
    await user.save();
    
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('sites', 'name slug domain');
    
    logger.success(`Utilisateur mis à jour: ${user.email}`);
    
    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Changer le mot de passe d'un utilisateur
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }
    
    // Si c'est son propre mot de passe, vérifier l'ancien
    if (userId.toString() === req.user._id.toString()) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel incorrect',
        });
      }
    }
    // Sinon, seul un admin peut changer le mot de passe sans l'ancien
    else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    logger.success(`Mot de passe changé pour: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Mot de passe mis à jour',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un utilisateur (admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }
    
    // Empêcher la suppression de son propre compte
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte',
      });
    }
    
    await user.deleteOne();
    
    logger.success(`Utilisateur supprimé: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assigner/Retirer des sites à un utilisateur (admin only)
 */
export const updateUserSites = async (req, res, next) => {
  try {
    const { sites } = req.body; // Array de site IDs
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }
    
    user.sites = sites;
    await user.save();
    
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('sites', 'name slug domain');
    
    logger.success(`Sites mis à jour pour: ${user.email}`);
    
    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
