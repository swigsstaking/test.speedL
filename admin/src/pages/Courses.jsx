import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { coursesAPI } from '../services/api';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import CourseModal from '../components/CourseModal';

const Courses = () => {
  const { currentSite } = useSite();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', currentSite?._id],
    queryFn: () => coursesAPI.getAll({ siteId: currentSite?._id }),
    enabled: !!currentSite,
  });

  const deleteMutation = useMutation({
    mutationFn: coursesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      toast.success('Cours supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    full: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
    completed: 'bg-gray-500/20 text-gray-400',
  };

  const statusLabels = {
    active: 'Actif',
    full: 'Complet',
    cancelled: 'Annulé',
    completed: 'Terminé',
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Gestion des cours</h1>
          <p className="text-gray-400">
            Gérez les cours pour {currentSite.name}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un cours</span>
        </button>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : coursesData?.data?.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Aucun cours</h3>
          <p className="text-gray-400 mb-6">
            Commencez par ajouter votre premier cours
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            Ajouter un cours
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {coursesData?.data?.map((course) => (
            <div key={course._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-100">
                      {course.title}
                    </h3>
                    <span className="text-sm text-gray-400">{course.number}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[course.status]}`}>
                      {statusLabels[course.status]}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{course.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Prix:</span>
                      <span className="text-gray-300 font-medium">{course.price.display}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Durée:</span>
                      <span className="text-gray-300">{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Catégorie:</span>
                      <span className="text-gray-300 capitalize">{course.category}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  {course.dates && course.dates.length > 0 && (
                    <div className="mt-4 p-4 bg-dark-800 rounded-lg border border-dark-700">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Prochaines dates
                      </h4>
                      <div className="space-y-2">
                        {course.dates.map((date, index) => (
                          <div key={index} className="text-sm text-gray-400">
                            <span className="font-medium text-gray-300">{date.day}</span>
                            {' - '}
                            {new Date(date.date).toLocaleDateString('fr-CH')}
                            {' à '}
                            {date.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-dark-800 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-800 rounded-lg transition-colors"
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

      {/* Course Modal */}
      {isModalOpen && (
        <CourseModal
          course={selectedCourse}
          siteId={currentSite._id}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Courses;
