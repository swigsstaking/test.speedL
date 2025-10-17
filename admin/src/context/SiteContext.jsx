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
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSite = (site) => {
    setCurrentSite(site);
    localStorage.setItem('currentSiteId', site._id);
  };

  const value = {
    sites,
    currentSite,
    loading,
    selectSite,
    refreshSites: loadSites,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};
