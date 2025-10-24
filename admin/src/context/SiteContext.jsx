import { createContext, useContext, useState, useEffect } from 'react';
import { sitesAPI } from '../services/api';

const SiteContext = createContext(null);

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within SiteProvider');
  }
  return context;
};

export const SiteProvider = ({ children }) => {
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStarted, setLoadingStarted] = useState(false);

  useEffect(() => {
    if (!loadingStarted) {
      loadSites();
    }
  }, [loadingStarted]);

  const loadSites = async () => {
    if (loadingStarted) return; // Prevent multiple calls
    setLoadingStarted(true);
    
    try {
      const response = await sitesAPI.getAll();
      setSites(response.data);
      
      // Set first site as current if none selected
      const savedSiteId = localStorage.getItem('currentSiteId');
      if (savedSiteId) {
        const site = response.data.find(s => s._id === savedSiteId);
        if (site) {
          setCurrentSite(site);
        } else if (response.data.length > 0) {
          setCurrentSite(response.data[0]);
          localStorage.setItem('currentSiteId', response.data[0]._id);
        }
      } else if (response.data.length > 0) {
        setCurrentSite(response.data[0]);
        localStorage.setItem('currentSiteId', response.data[0]._id);
      }
    } catch (error) {
      // Error silently handled - user will see empty state
    } finally {
      setLoading(false);
    }
  };

  const selectSite = (site) => {
    setCurrentSite(site);
    localStorage.setItem('currentSiteId', site._id);
  };

  const refreshSite = async () => {
    if (!currentSite) return;
    try {
      const response = await sitesAPI.getById(currentSite._id);
      setCurrentSite(response.data);
      // Mettre à jour aussi dans la liste
      setSites(prev => prev.map(s => s._id === response.data._id ? response.data : s));
    } catch (error) {
      console.error('Error refreshing site:', error);
    }
  };

  const value = {
    sites,
    currentSite,
    loading,
    selectSite,
    refreshSites: loadSites,
    refreshSite,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};
