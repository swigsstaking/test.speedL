import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { contentAPI, sitesAPI } from '../services/api';
import { Plus, Edit, Trash2, Eye, EyeOff, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Content = () => {
  const { currentSite, refreshSite } = useSite();
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [newSection, setNewSection] = useState({ value: '', label: '' });
  const [formData, setFormData] = useState({
    section: '',
    type: 'text',
    data: {},
    order: 0,
    isActive: true,
  });

  // Utiliser les sections du site ou des sections par défaut
  const sections = currentSite?.sections && currentSite.sections.length > 0
    ? ['all', ...currentSite.sections.sort((a, b) => a.order - b.order).map(s => s.value)]
    : ['all', 'hero', 'about', 'services', 'testimonials', 'faq', 'footer'];

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', currentSite?._id, selectedSection],
    queryFn: () => contentAPI.getAll({ 
      siteId: currentSite?._id,
      section: selectedSection !== 'all' ? selectedSection : undefined 
    }),
    enabled: !!currentSite,
  });

  const deleteMutation = useMutation({
    mutationFn: contentAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['content']);
      toast.success('Contenu supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => contentAPI.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['content']);
      toast.success('Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingContent) {
        return contentAPI.update(editingContent._id, data);
      }
      return contentAPI.create({ ...data, siteId: currentSite._id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content']);
      toast.success(editingContent ? 'Contenu modifié' : 'Contenu créé');
      setShowModal(false);
      setEditingContent(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: (newSections) => sitesAPI.updateSections(currentSite._id, newSections),
    onSuccess: () => {
      queryClient.invalidateQueries(['sites']);
      refreshSite();
      toast.success('Section ajoutée avec succès');
      setShowAddSectionModal(false);
      setNewSection({ value: '', label: '' });
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout de la section');
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id, currentStatus) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleEdit = (item) => {
    setEditingContent(item);
    setFormData({
      section: item.section,
      type: item.type,
      data: item.data,
      order: item.order,
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleAddSection = () => {
    if (!newSection.value || !newSection.label) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const currentSections = currentSite?.sections || [];
    if (currentSections.find(s => s.value === newSection.value)) {
      toast.error('Cette section existe déjà');
      return;
    }

    const updatedSections = [
      ...currentSections,
      { ...newSection, order: currentSections.length }
    ];

    addSectionMutation.mutate(updatedSections);
  };

  const resetForm = () => {
    setFormData({
      section: '',
      type: 'text',
      data: {},
      order: 0,
      isActive: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Sélectionnez un site pour gérer le contenu</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Gestion du Contenu</h1>
          <p className="text-gray-400 mt-2">Gérez les blocs de contenu de {currentSite.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddSectionModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle section</span>
          </button>
          <button
            onClick={() => {
              setEditingContent(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau contenu</span>
          </button>
        </div>
      </div>

      {/* Section Filter */}
      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedSection === section
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
            }`}
          >
            {section === 'all' ? 'Tous' : section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : contentData?.data?.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">Aucun contenu trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contentData?.data?.map((item) => (
            <div
              key={item._id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-dark-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-primary-600/20 text-primary-400 text-xs font-medium rounded-full">
                      {item.section}
                    </span>
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
                      {item.type}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.isActive 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {item.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm">
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-dark-900 p-3 rounded">
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Ordre: {item.order} • Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(item._id, item.isActive)}
                    className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-700 rounded-lg transition-colors"
                    title={item.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {item.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Créer/Éditer contenu */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl border border-dark-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-100">
                {editingContent ? 'Éditer le contenu' : 'Nouveau contenu'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingContent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {sections.filter(s => s !== 'all').map((section) => {
                      const sectionObj = currentSite?.sections?.find(s => s.value === section);
                      return (
                        <option key={section} value={section}>
                          {sectionObj?.label || section}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="label">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="text">Texte</option>
                    <option value="html">HTML</option>
                    <option value="image">Image</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Données (JSON) *</label>
                <textarea
                  value={JSON.stringify(formData.data, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, data: parsed }));
                    } catch (err) {
                      // Laisser l'utilisateur éditer
                    }
                  }}
                  className="input font-mono text-sm"
                  rows="10"
                  placeholder='{"title": "Mon titre", "description": "Ma description"}'
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    className="input"
                    min="0"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300">Actif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingContent(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
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
          </div>
        </div>
      )}

      {/* Modal Ajouter une section */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-100">Ajouter une section</h3>
              <button
                onClick={() => {
                  setShowAddSectionModal(false);
                  setNewSection({ value: '', label: '' });
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
                  value={newSection.value}
                  onChange={(e) => setNewSection(prev => ({ ...prev, value: e.target.value }))}
                  className="input"
                  placeholder="ex: features, pricing, team"
                />
              </div>

              <div>
                <label className="label">Libellé</label>
                <input
                  type="text"
                  value={newSection.label}
                  onChange={(e) => setNewSection(prev => ({ ...prev, label: e.target.value }))}
                  className="input"
                  placeholder="ex: Fonctionnalités, Tarifs, Équipe"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddSectionModal(false);
                    setNewSection({ value: '', label: '' });
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSection}
                  disabled={addSectionMutation.isPending}
                  className="btn-primary"
                >
                  {addSectionMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;
