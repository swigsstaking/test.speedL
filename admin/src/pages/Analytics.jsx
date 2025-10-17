import { useQuery } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { coursesAPI, seoAPI, contentAPI, mediaAPI } from '../services/api';
import { TrendingUp, Users, BookOpen, Eye, FileText, Image as ImageIcon, Calendar } from 'lucide-react';

const Analytics = () => {
  const { currentSite } = useSite();

  // Récupérer les statistiques
  const { data: coursesData } = useQuery({
    queryKey: ['courses', currentSite?._id],
    queryFn: () => coursesAPI.getAll({ siteId: currentSite?._id }),
    enabled: !!currentSite,
  });

  const { data: seoData } = useQuery({
    queryKey: ['seo', currentSite?._id],
    queryFn: () => seoAPI.getAll({ siteId: currentSite?._id }),
    enabled: !!currentSite,
  });

  const { data: contentData } = useQuery({
    queryKey: ['content', currentSite?._id],
    queryFn: () => contentAPI.getAll({ siteId: currentSite?._id }),
    enabled: !!currentSite,
  });

  const { data: mediaData } = useQuery({
    queryKey: ['media'],
    queryFn: mediaAPI.getAll,
  });

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Sélectionnez un site pour voir les statistiques</p>
      </div>
    );
  }

  // Calculer les statistiques
  const stats = {
    totalCourses: coursesData?.data?.length || 0,
    activeCourses: coursesData?.data?.filter(c => c.status === 'active').length || 0,
    totalSEO: seoData?.data?.length || 0,
    totalContent: contentData?.data?.length || 0,
    activeContent: contentData?.data?.filter(c => c.isActive).length || 0,
    totalMedia: mediaData?.data?.length || 0,
  };

  // Statistiques par catégorie de cours
  const coursesByCategory = coursesData?.data?.reduce((acc, course) => {
    const category = course.category || 'Non catégorisé';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {}) || {};

  // Statistiques par statut de cours
  const coursesByStatus = coursesData?.data?.reduce((acc, course) => {
    acc[course.status] = (acc[course.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-primary-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-600/20 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <TrendingUp className="w-5 h-5 text-green-400" />
      </div>
      <h3 className="text-3xl font-bold text-gray-100 mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const BarChart = ({ data, title }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-6">{title}</h3>
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{key}</span>
                <span className="text-sm font-semibold text-gray-100">{value}</span>
              </div>
              <div className="w-full bg-dark-900 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Analytics</h1>
        <p className="text-gray-400 mt-2">Vue d'ensemble des statistiques de {currentSite.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Formations"
          value={stats.totalCourses}
          icon={BookOpen}
          color="primary"
          subtitle={`${stats.activeCourses} actives`}
        />
        <StatCard
          title="Pages SEO"
          value={stats.totalSEO}
          icon={Eye}
          color="blue"
          subtitle="Optimisées"
        />
        <StatCard
          title="Blocs de contenu"
          value={stats.totalContent}
          icon={FileText}
          color="green"
          subtitle={`${stats.activeContent} actifs`}
        />
        <StatCard
          title="Fichiers média"
          value={stats.totalMedia}
          icon={ImageIcon}
          color="purple"
          subtitle="Images et documents"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Object.keys(coursesByCategory).length > 0 && (
          <BarChart data={coursesByCategory} title="Formations par catégorie" />
        )}
        {Object.keys(coursesByStatus).length > 0 && (
          <BarChart data={coursesByStatus} title="Formations par statut" />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-600" />
          Activité récente
        </h3>
        <div className="space-y-4">
          {coursesData?.data?.slice(0, 5).map((course) => (
            <div key={course._id} className="flex items-center justify-between py-3 border-b border-dark-700 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{course.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                course.status === 'active' 
                  ? 'bg-green-600/20 text-green-400' 
                  : course.status === 'full'
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : 'bg-gray-600/20 text-gray-400'
              }`}>
                {course.status}
              </span>
            </div>
          ))}
          {(!coursesData?.data || coursesData.data.length === 0) && (
            <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/courses"
          className="p-4 bg-primary-600/10 border border-primary-600/20 rounded-lg hover:bg-primary-600/20 transition-colors"
        >
          <BookOpen className="w-6 h-6 text-primary-400 mb-2" />
          <h4 className="text-sm font-semibold text-gray-200">Gérer les formations</h4>
          <p className="text-xs text-gray-500 mt-1">Ajouter ou modifier des cours</p>
        </a>
        <a
          href="/seo"
          className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg hover:bg-blue-600/20 transition-colors"
        >
          <Eye className="w-6 h-6 text-blue-400 mb-2" />
          <h4 className="text-sm font-semibold text-gray-200">Optimiser le SEO</h4>
          <p className="text-xs text-gray-500 mt-1">Améliorer le référencement</p>
        </a>
        <a
          href="/media"
          className="p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg hover:bg-purple-600/20 transition-colors"
        >
          <ImageIcon className="w-6 h-6 text-purple-400 mb-2" />
          <h4 className="text-sm font-semibold text-gray-200">Médiathèque</h4>
          <p className="text-xs text-gray-500 mt-1">Gérer les images et fichiers</p>
        </a>
      </div>
    </div>
  );
};

export default Analytics;
