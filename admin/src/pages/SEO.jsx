import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { seoAPI, sitesAPI } from '../services/api';
import { Search, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SEO = () => {
  const { currentSite, refreshSite } = useSite();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState('home');
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPage, setNewPage] = useState({ value: '', label: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    robots: 'index,follow',
  });

  // Utiliser les pages du site ou des pages par défaut
  const pages = currentSite?.pages && currentSite.pages.length > 0 
    ? currentSite.pages.sort((a, b) => a.order - b.order)
    : [
        { value: 'home', label: 'Page d\'accueil', order: 0 },
        { value: 'cours', label: 'Cours & Inscriptions', order: 1 },
        { value: 'permis', label: 'Permis', order: 2 },
        { value: 'bons-cadeaux', label: 'Bons cadeaux', order: 3 },
        { value: 'contact', label: 'Contact', order: 4 },
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

  const addPageMutation = useMutation({
    mutationFn: (newPages) => sitesAPI.updatePages(currentSite._id, newPages),
    onSuccess: () => {
      queryClient.invalidateQueries(['sites']);
      refreshSite();
      toast.success('Page ajoutée avec succès');
      setShowAddPageModal(false);
      setNewPage({ value: '', label: '' });
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout de la page');
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

  const handleAddPage = () => {
    if (!newPage.value || !newPage.label) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Vérifier si la page existe déjà
    if (pages.find(p => p.value === newPage.value)) {
      toast.error('Cette page existe déjà');
      return;
    }

    const updatedPages = [
      ...pages,
      { ...newPage, order: pages.length }
    ];

    addPageMutation.mutate(updatedPages);
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Pages
              </h2>
              <button
                onClick={() => setShowAddPageModal(true)}
                className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                title="Ajouter une page"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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

      {/* Modal Ajouter une page */}
      {showAddPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-100">Ajouter une page</h3>
              <button
                onClick={() => {
                  setShowAddPageModal(false);
                  setNewPage({ value: '', label: '' });
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Identifiant (slug)</label>
                <input
                  type="text"
                  value={newPage.value}
                  onChange={(e) => setNewPage(prev => ({ ...prev, value: e.target.value }))}
                  className="input"
                  placeholder="ex: about, services, pricing"
                />
              </div>

              <div>
                <label className="label">Libellé</label>
                <input
                  type="text"
                  value={newPage.label}
                  onChange={(e) => setNewPage(prev => ({ ...prev, label: e.target.value }))}
                  className="input"
                  placeholder="ex: À propos, Services, Tarifs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddPageModal(false);
                    setNewPage({ value: '', label: '' });
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddPage}
                  disabled={addPageMutation.isPending}
                  className="btn-primary"
                >
                  {addPageMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEO;
