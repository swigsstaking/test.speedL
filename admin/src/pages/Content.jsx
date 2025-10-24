import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { contentAPI } from '../services/api';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Content = () => {
  const { currentSite } = useSite();
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState('all');

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

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id, currentStatus) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  // Utiliser les sections du site ou les sections par défaut
  const sectionsList = currentSite?.sections && currentSite.sections.length > 0
    ? currentSite.sections.map(s => s.value)
    : ['hero', 'about', 'services', 'testimonials', 'faq', 'footer'];
  
  const sections = ['all', ...sectionsList];

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
          <p className="text-gray-400 mt-2">Gérez les blocs de contenu de votre site</p>
        </div>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau contenu</span>
        </button>
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
    </div>
  );
};

export default Content;
