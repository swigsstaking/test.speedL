import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { sitesAPI } from '../services/api';
import { Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { currentSite, refreshSites } = useSite();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  });

  // Load site data when currentSite changes
  useEffect(() => {
    if (currentSite) {
      setFormData({
        name: currentSite.name || '',
        domain: currentSite.domain || '',
        description: currentSite.description || '',
        email: currentSite.contact?.email || '',
        phone: currentSite.contact?.phone || '',
        address: currentSite.contact?.address || '',
        facebook: currentSite.social?.facebook || '',
        twitter: currentSite.social?.twitter || '',
        instagram: currentSite.social?.instagram || '',
        linkedin: currentSite.social?.linkedin || '',
      });
    }
  }, [currentSite]);

  const updateMutation = useMutation({
    mutationFn: (data) => sitesAPI.update(currentSite._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sites']);
      refreshSites();
      toast.success('Paramètres mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      domain: formData.domain,
      description: formData.description,
      contact: {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      },
      social: {
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
      },
    };

    updateMutation.mutate(updateData);
  };

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Sélectionnez un site pour gérer les paramètres</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Paramètres du Site</h1>
        <p className="text-gray-400 mt-2">Configurez les informations de votre site</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Info */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary-600" />
            Informations Générales
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du site
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Domaine
              </label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                placeholder="exemple.com"
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-primary-600" />
            Coordonnées
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
            <Facebook className="w-5 h-5 mr-2 text-primary-600" />
            Réseaux Sociaux
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Facebook className="w-4 h-4 inline mr-2" />
                Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Twitter className="w-4 h-4 inline mr-2" />
                Twitter
              </label>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Instagram className="w-4 h-4 inline mr-2" />
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Linkedin className="w-4 h-4 inline mr-2" />
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/..."
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
