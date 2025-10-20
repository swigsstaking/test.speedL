import { useMemo } from 'react';
import seoData from '../data/seo.json';

/**
 * Hook pour récupérer les données SEO d'une page
 * @param {string} page - Nom de la page (home, courses, permits, etc.)
 * @returns {object} Données SEO de la page
 */
export const useSEO = (page = 'home') => {
  const seo = useMemo(() => {
    const pageSEO = seoData.pages[page] || seoData.pages.home;
    const global = seoData.global;

    return {
      // Données de la page
      title: pageSEO.title,
      description: pageSEO.description,
      keywords: pageSEO.keywords,
      
      // Open Graph
      ogTitle: pageSEO.ogTitle || pageSEO.title,
      ogDescription: pageSEO.ogDescription || pageSEO.description,
      ogImage: pageSEO.ogImage || global.logo,
      ogUrl: `${global.siteUrl}${page === 'home' ? '' : `/${page}`}`,
      
      // Twitter Card
      twitterCard: pageSEO.twitterCard || 'summary_large_image',
      
      // Autres
      canonical: pageSEO.canonical || `${global.siteUrl}${page === 'home' ? '' : `/${page}`}`,
      robots: pageSEO.robots || 'index,follow',
      language: global.language || 'fr',
      
      // Global
      siteName: global.siteName,
      siteUrl: global.siteUrl,
      favicon: global.favicon,
    };
  }, [page]);

  return seo;
};

export default useSEO;
