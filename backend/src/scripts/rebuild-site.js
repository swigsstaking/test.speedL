import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import generateSEO from './generate-seo.js';
import logger from '../utils/logger.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Workflow complet de rebuild du site
 * 1. Génère le SEO depuis la DB
 * 2. Commit les changements dans Git
 * 3. Rebuild le site
 * 4. Déploie (optionnel)
 */
const rebuildSite = async (options = {}) => {
  const {
    siteslug = 'speed-l',
    skipGit = false,
    skipBuild = false,
    skipDeploy = true,
  } = options;

  const startTime = Date.now();
  const logFile = path.join(__dirname, '../../../rebuild.log');

  const log = async (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    await fs.appendFile(logFile, logMessage);
  };

  try {
    await log('🚀 Début du rebuild du site');
    await log(`📦 Site: ${siteslug}`);

    // Étape 1: Générer le SEO
    await log('\n📝 Étape 1/4: Génération du SEO...');
    const sites = await generateSEO();
    await log(`✅ SEO généré pour: ${sites.join(', ')}`);

    // Étape 2: Git commit (si activé)
    if (!skipGit) {
      await log('\n📦 Étape 2/4: Git commit...');
      
      const projectRoot = path.join(__dirname, '../../..');
      
      try {
        // Vérifier s'il y a des changements
        const { stdout: status } = await execAsync('git status --porcelain', { cwd: projectRoot });
        
        if (status.trim()) {
          // Il y a des changements
          await execAsync('git add src/data/seo.json', { cwd: projectRoot });
          
          const commitMessage = `chore: Update SEO data - ${new Date().toISOString()}`;
          await execAsync(`git commit -m "${commitMessage}"`, { cwd: projectRoot });
          
          await log('✅ Changements committés');
          
          // Push (optionnel)
          if (process.env.AUTO_GIT_PUSH === 'true') {
            await execAsync('git push origin main', { cwd: projectRoot });
            await log('✅ Changements pushés sur GitHub');
          } else {
            await log('ℹ️  Push manuel requis (AUTO_GIT_PUSH=false)');
          }
        } else {
          await log('ℹ️  Aucun changement SEO détecté');
        }
      } catch (gitError) {
        await log(`⚠️  Erreur Git (non bloquante): ${gitError.message}`);
      }
    } else {
      await log('\n⏭️  Étape 2/4: Git commit ignoré');
    }

    // Étape 3: Build du site (si activé)
    if (!skipBuild) {
      await log('\n🔨 Étape 3/4: Build du site...');
      
      const siteRoot = path.join(__dirname, '../../..');
      
      try {
        const { stdout, stderr } = await execAsync('npm run build', { 
          cwd: siteRoot,
          timeout: 120000, // 2 minutes max
        });
        
        if (stderr && !stderr.includes('warning')) {
          await log(`⚠️  Warnings: ${stderr}`);
        }
        
        await log('✅ Site buildé avec succès');
      } catch (buildError) {
        await log(`❌ Erreur de build: ${buildError.message}`);
        throw buildError;
      }
    } else {
      await log('\n⏭️  Étape 3/4: Build ignoré');
    }

    // Étape 4: Déploiement (si activé)
    if (!skipDeploy) {
      await log('\n🚀 Étape 4/4: Déploiement...');
      
      const deployPath = process.env.DEPLOY_PATH || '/var/www/speed-l';
      const distPath = path.join(__dirname, '../../../dist');
      
      try {
        // Copier les fichiers buildés (sans sudo si permissions OK)
        try {
          await execAsync(`cp -r ${distPath}/* ${deployPath}/`);
          await log(`✅ Site déployé vers ${deployPath}`);
        } catch (cpError) {
          // Si erreur de permission, essayer avec sudo (nécessite configuration sudoers)
          await log(`⚠️  Tentative avec sudo...`);
          await execAsync(`sudo -n cp -r ${distPath}/* ${deployPath}/`);
          await log(`✅ Site déployé vers ${deployPath} (avec sudo)`);
        }
      } catch (deployError) {
        await log(`❌ Erreur de déploiement: ${deployError.message}`);
        await log(`💡 Astuce: Configurez les permissions ou ajoutez l'utilisateur au groupe www-data`);
        throw deployError;
      }
    } else {
      await log('\n⏭️  Étape 4/4: Déploiement ignoré');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    await log(`\n✅ Rebuild terminé avec succès en ${duration}s`);
    
    return {
      success: true,
      duration,
      sites,
    };

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    await log(`\n❌ Rebuild échoué après ${duration}s: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      duration,
    };
  }
};

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    skipGit: args.includes('--skip-git'),
    skipBuild: args.includes('--skip-build'),
    skipDeploy: !args.includes('--deploy'),
  };

  rebuildSite(options)
    .then((result) => {
      if (result.success) {
        logger.success('Rebuild terminé');
        process.exit(0);
      } else {
        logger.error('Rebuild échoué');
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error('Erreur fatale:', error);
      process.exit(1);
    });
}

export default rebuildSite;
