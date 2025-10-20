import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rebuild le site Speed-L
export const rebuildSite = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../../../rebuild-site.sh');
    
    logger.info('Déclenchement du rebuild du site...');
    
    // Exécuter le script en arrière-plan
    exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        logger.error('Erreur lors du rebuild:', error.message);
        return;
      }
      logger.success('Rebuild terminé');
      if (stderr) {
        logger.warn('Warnings:', stderr);
      }
    });
    
    // Répondre immédiatement (le rebuild se fait en arrière-plan)
    res.json({
      success: true,
      message: 'Rebuild du site déclenché. Le site sera mis à jour dans 30-60 secondes.',
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
