import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import fs from 'fs';
import rebuildSiteScript from '../scripts/rebuild-site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rebuild le site Speed-L
export const rebuildSite = async (req, res) => {
  try {
    logger.info('Déclenchement du rebuild du site...');
    
    // Exécuter le rebuild en arrière-plan
    rebuildSiteScript({
      skipDeploy: process.env.NODE_ENV !== 'production',
    }).then((result) => {
      if (result.success) {
        logger.success(`Rebuild terminé en ${result.duration}s`);
      } else {
        logger.error(`Rebuild échoué: ${result.error}`);
      }
    }).catch((error) => {
      logger.error('Erreur rebuild:', error.message);
    });
    
    // Répondre immédiatement (le rebuild se fait en arrière-plan)
    res.json({
      success: true,
      message: 'Rebuild du site déclenché. Le site sera mis à jour dans 1-2 minutes.',
    });
  } catch (error) {
    logger.error('Erreur webhook rebuild:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Obtenir le statut du dernier rebuild
export const getRebuildStatus = async (req, res) => {
  try {
    const logPath = path.join(__dirname, '../../../rebuild.log');
    
    if (!fs.existsSync(logPath)) {
      return res.json({
        success: true,
        data: {
          lastRebuild: null,
          status: 'Aucun rebuild effectué',
        },
      });
    }
    
    // Lire les dernières lignes du log
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    
    res.json({
      success: true,
      data: {
        lastRebuild: lastLine,
        totalRebuilds: lines.length,
      },
    });
  } catch (error) {
    logger.error('Erreur status rebuild:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
