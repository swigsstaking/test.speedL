import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useSiteInfo = () => {
  const [siteInfo, setSiteInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/sites`);
        const data = await response.json();
        const speedLSite = data.data.find(site => site.slug === 'speed-l');
        
        if (speedLSite) {
          setSiteInfo(speedLSite);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des infos du site:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteInfo();
  }, []);

  return { siteInfo, loading };
};
