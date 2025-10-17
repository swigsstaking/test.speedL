import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { seoAPI } from '../services/api';
import { Search, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const SEO = () => {
  const { currentSite } = useSite();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState('home');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    robots: 'index,follow',
  });

  const pages = [
    { value: 'home', label: 'Page d\'accueil' },
    { value: 'cours', label: 'Cours & Inscriptions' },
    { value: 'permis', label: 'Permis' },
    { value: 'bons-cadeaux', label: 'Bons cadeaux' },
    { value: 'contact', label: 'Contact' },
  ];

  const { data: seoData, isLoading } = useQuery({
    queryKey: ['seo', currentSite?._id, selectedPage],
    queryFn: () => seoAPI.getAll({ siteId: currentSite?._id, page: selectedPage }),
    enabled: !!currentSite,
  });

  // Préremplir le formulaire quand les données SEO changent
  useEffect(() => {
    if (seoData?.data?.[0]) {
      const seo = seoData.data[0];
      setFormData({
        title: seo.title || '',
        description: seo.description || '',
        keywords: seo.keywords || [],
        ogTitle: seo.ogTitle || '',
        ogDescription: seo.ogDescription || '',
        robots: seo.robots || 'index,follow',
      });
    } else {
      // Reset form for new page
      setFormData({
        title: '',
        description: '',
        keywords: [],
        ogTitle: '',
        ogDescription: '',
        robots: 'index,follow',
      });
    }
  }, [seoData, selectedPage]);

  const saveMutation = useMutation({
    mutationFn: (data) => seoAPI.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo']);
      toast.success('SEO enregistré avec succès');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      site: currentSite._id,
      page: selectedPage,
      ...formData,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeywordsChange = (e) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, keywords }));
  };

  if (!currentSite) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <p className="text-gray-400">Veuillez sélectionner un site</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Gestion SEO</h1>
        <p className="text-gray-400">
          Optimisez le référencement de {currentSite.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page Selector */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Pages
            </h2>
            <div className="space-y-2">
              {pages.map((page) => (
                <button
                  key={page.value}
                  onClick={() => setSelectedPage(page.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedPage === page.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Form */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="card p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="label">
                  Titre SEO * <span className="text-xs text-gray-500">(max 60 caractères)</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={60}
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/60 caractères
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="label">
                  Description SEO * <span className="text-xs text-gray-500">(max 160 caractères)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={160}
                  className="input"
                  rows="3"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/160 caractères
                </p>
              </div>

              {/* Keywords */}
              <div>
                <label className="label">
                  Mots-clés <span className="text-xs text-gray-500">(séparés par des virgules)</span>
                </label>
                <input
                  type="text"
                  value={formData.keywords.join(', ')}
                  onChange={handleKeywordsChange}
                  className="input"
                  placeholder="auto-école, sion, permis de conduire"
                />
              </div>

              {/* Open Graph */}
              <div className="pt-4 border-t border-dark-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  Open Graph (Réseaux sociaux)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="label">Titre OG</label>
                    <input
                      type="text"
                      name="ogTitle"
                      value={formData.ogTitle}
                      onChange={handleChange}
                      maxLength={60}
                      className="input"
                      placeholder="Laissez vide pour utiliser le titre SEO"
                    />
                  </div>

                  <div>
                    <label className="label">Description OG</label>
                    <textarea
                      name="ogDescription"
                      value={formData.ogDescription}
                      onChange={handleChange}
                      maxLength={160}
                      className="input"
                      rows="2"
                      placeholder="Laissez vide pour utiliser la description SEO"
                    />
                  </div>
                </div>
              </div>

              {/* Robots */}
              <div>
                <label className="label">Indexation</label>
                <select
                  name="robots"
                  value={formData.robots}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="index,follow">Index, Follow (Recommandé)</option>
                  <option value="noindex,follow">No Index, Follow</option>
                  <option value="index,nofollow">Index, No Follow</option>
                  <option value="noindex,nofollow">No Index, No Follow</option>
                </select>
              </div>

              {/* Preview */}
              <div className="pt-4 border-t border-dark-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  Aperçu Google
                </h3>
                <div className="p-4 bg-dark-800 rounded-lg border border-dark-700">
                  <div className="text-blue-500 text-lg mb-1 truncate">
                    {formData.title || 'Titre de la page'}
                  </div>
                  <div className="text-green-600 text-sm mb-2">
                    {currentSite.domain} › {selectedPage}
                  </div>
                  <div className="text-gray-400 text-sm line-clamp-2">
                    {formData.description || 'Description de la page...'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t border-dark-700">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEO;
