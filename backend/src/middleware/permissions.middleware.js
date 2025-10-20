import logger from '../utils/logger.js';

/**
 * Middleware pour vérifier l'accès à un site spécifique
 * Les admins ont accès à tous les sites
 * Les editors n'ont accès qu'aux sites qui leur sont assignés
 */
export const checkSiteAccess = (req, res, next) => {
  try {
    const user = req.user;
    
    // Récupérer le siteId depuis les params, query ou body
    const siteId = req.params.siteId || req.query.siteId || req.body.siteId || req.body.site;
    
    if (!siteId) {
      // Si pas de siteId, laisser passer (routes globales)
      return next();
    }
    
    // Les admins ont accès à tous les sites
    if (user.role === 'admin') {
      logger.debug(`Admin ${user.email} accède au site ${siteId}`);
      return next();
    }
    
    // Les editors doivent avoir le site dans leur liste
    if (user.role === 'editor') {
      const hasAccess = user.sites.some(site => site.toString() === siteId.toString());
      
      if (hasAccess) {
        logger.debug(`Editor ${user.email} accède au site ${siteId}`);
        return next();
      } else {
        logger.warn(`Editor ${user.email} refusé pour le site ${siteId}`);
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas accès à ce site',
        });
      }
    }
    
    // Rôle inconnu
    return res.status(403).json({
      success: false,
      message: 'Rôle utilisateur invalide',
    });
    
  } catch (error) {
    logger.error('Erreur checkSiteAccess:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification des permissions',
    });
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur est admin
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logger.warn(`Non-admin ${req.user.email} tente d'accéder à une route admin`);
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs',
    });
  }
  next();
};

/**
 * Middleware pour vérifier qu'un utilisateur peut modifier un autre utilisateur
 * - Les admins peuvent modifier tout le monde
 * - Les users ne peuvent modifier que leur propre profil
 */
export const canModifyUser = (req, res, next) => {
  const currentUser = req.user;
  const targetUserId = req.params.id || req.params.userId;
  
  // Admin peut tout modifier
  if (currentUser.role === 'admin') {
    return next();
  }
  
  // Un user peut modifier son propre profil
  if (targetUserId && targetUserId.toString() === currentUser._id.toString()) {
    return next();
  }
  
  logger.warn(`User ${currentUser.email} tente de modifier un autre utilisateur`);
  return res.status(403).json({
    success: false,
    message: 'Vous ne pouvez modifier que votre propre profil',
  });
};

/**
 * Middleware pour filtrer les sites selon les permissions
 * Ajoute req.allowedSites avec la liste des sites accessibles
 */
export const filterSitesByPermissions = (req, res, next) => {
  const user = req.user;
  
  if (user.role === 'admin') {
    // Admin voit tous les sites (pas de filtre)
    req.allowedSites = null; // null = tous
  } else if (user.role === 'editor') {
    // Editor voit uniquement ses sites
    req.allowedSites = user.sites;
  } else {
    // Autres rôles : aucun site
    req.allowedSites = [];
  }
  
  next();
};

export default {
  checkSiteAccess,
  requireAdmin,
  canModifyUser,
  filterSitesByPermissions,
};
