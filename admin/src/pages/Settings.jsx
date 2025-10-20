import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { sitesAPI, mediaAPI, webhookAPI } from '../services/api';
import { Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Upload, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { currentSite, refreshSites } = useSite();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    logoUrl: '',
    logoAlt: '',
    faviconUrl: '',
    email: '',
    formsEmail: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    whatsapp: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    tiktok: '',
  });

  // Load site data when currentSite changes
  useEffect(() => {
    if (currentSite) {
      setFormData({
        name: currentSite.name || '',
        domain: currentSite.domain || '',
        description: currentSite.description || '',
        logoUrl: currentSite.logo?.url || '',
        logoAlt: currentSite.logo?.alt || currentSite.name || '',
        faviconUrl: currentSite.favicon || '',
        email: currentSite.contact?.email || '',
        formsEmail: currentSite.contact?.formsEmail || '',
        phone: currentSite.contact?.phone || '',
        address: currentSite.contact?.address || '',
        city: currentSite.contact?.city || '',
        postalCode: currentSite.contact?.postalCode || '',
        country: currentSite.contact?.country || 'Suisse',
        whatsapp: currentSite.contact?.whatsapp || '',
        facebook: currentSite.social?.facebook || '',
        twitter: currentSite.social?.twitter || '',
        instagram: currentSite.social?.instagram || '',
        linkedin: currentSite.social?.linkedin || '',
        tiktok: currentSite.social?.tiktok || '',
      });
      setLogoPreview(currentSite.logo?.url || null);
      setFaviconPreview(currentSite.favicon || null);
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await mediaAPI.upload(file);
      const logoUrl = response.url;
      setFormData({ ...formData, logoUrl });
      setLogoPreview(logoUrl);
      toast.success('Logo uploadé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload du logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 1MB pour favicon)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Le favicon ne doit pas dépasser 1MB');
      return;
    }

    setUploadingFavicon(true);
    try {
      const response = await mediaAPI.upload(file);
      const faviconUrl = response.url;
      setFormData({ ...formData, faviconUrl });
      setFaviconPreview(faviconUrl);
      toast.success('Favicon uploadé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload du favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleRemoveFavicon = () => {
    setFormData({ ...formData, faviconUrl: '' });
    setFaviconPreview(null);
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      domain: formData.domain,
      description: formData.description,
      logo: {
        url: formData.logoUrl,
        alt: formData.logoAlt || formData.name,
      },
      favicon: formData.faviconUrl,
      contact: {
        email: formData.email,
        formsEmail: formData.formsEmail,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        whatsapp: formData.whatsapp,
      },
      social: {
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
        tiktok: formData.tiktok,
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
        {/* Logo Section */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-600" />
            Logo du Site
          </h2>
          <div className="space-y-4">
            {/* Logo Preview */}
            {logoPreview ? (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-xs max-h-32 object-contain bg-white p-4 rounded-lg border-2 border-dark-700"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="red">Erreur</text></svg>';
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full max-w-xs h-32 bg-dark-900 border-2 border-dashed border-dark-700 rounded-lg">
                <ImageIcon className="w-12 h-12 text-gray-600" />
              </div>
            )}

            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 text-gray-300 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Upload en cours...' : 'Choisir un logo'}</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Formats acceptés : JPG, PNG, SVG, WebP (max 5MB)
              </p>
            </div>

            {/* Logo Alt Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texte alternatif (SEO)
              </label>
              <input
                type="text"
                name="logoAlt"
                value={formData.logoAlt}
                onChange={handleChange}
                placeholder="Logo de Speed-L Auto-école"
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Favicon Section */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-600" />
            Favicon du Site
          </h2>
          <div className="space-y-4">
            {/* Favicon Preview */}
            {faviconPreview ? (
              <div className="relative inline-block">
                <img
                  src={faviconPreview}
                  alt="Favicon preview"
                  className="w-16 h-16 object-contain bg-white p-2 rounded-lg border-2 border-dark-700"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="red">Erreur</text></svg>';
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveFavicon}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-16 h-16 bg-dark-900 border-2 border-dashed border-dark-700 rounded-lg">
                <ImageIcon className="w-8 h-8 text-gray-600" />
              </div>
            )}

            {/* Upload Button */}
            <div>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingFavicon}
                className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 text-gray-300 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingFavicon ? 'Upload en cours...' : 'Choisir un favicon'}</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Formats acceptés : ICO, PNG (32x32 ou 16x16, max 1MB)
              </p>
            </div>
          </div>
        </div>

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
                <Mail className="w-4 h-4 inline mr-2" />
                Email pour les formulaires
              </label>
              <input
                type="email"
                name="formsEmail"
                value={formData.formsEmail}
                onChange={handleChange}
                placeholder="contact@example.com"
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
              <p className="text-sm text-gray-500 mt-1">
                Les formulaires de contact et bons cadeaux seront envoyés à cette adresse
              </p>
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
                placeholder="Rue et numéro"
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="1000"
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Lausanne"
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pays
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Suisse"
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                WhatsApp
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+41 79 123 45 67"
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🎵 TikTok
              </label>
              <input
                type="url"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@..."
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
