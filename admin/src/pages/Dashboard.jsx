import { useQuery } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { coursesAPI, seoAPI } from '../services/api';
import { BookOpen, Search, Globe, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { currentSite } = useSite();

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

  const stats = [
    {
      name: 'Cours actifs',
      value: coursesData?.data?.filter(c => c.status === 'active').length || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Pages SEO',
      value: seoData?.data?.length || 0,
      icon: Search,
      color: 'bg-green-500',
    },
    {
      name: 'Site actuel',
      value: currentSite?.name || 'Aucun',
      icon: Globe,
      color: 'bg-purple-500',
      isText: true,
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Bienvenue sur le panneau d'administration SWIGS CMS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-100">
                    {stat.isText ? (
                      <span className="text-xl">{stat.value}</span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Courses */}
      {coursesData?.data && coursesData.data.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Cours récents</h2>
          <div className="space-y-3">
            {coursesData.data.slice(0, 5).map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700"
              >
                <div>
                  <h3 className="font-medium text-gray-200">{course.title}</h3>
                  <p className="text-sm text-gray-400">{course.number}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">{course.price.display}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/courses"
            className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-primary-500 mb-2" />
            <h3 className="font-medium text-gray-200">Gérer les cours</h3>
            <p className="text-sm text-gray-400 mt-1">Ajouter ou modifier des cours</p>
          </a>
          <a
            href="/seo"
            className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors"
          >
            <Search className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-200">Optimiser le SEO</h3>
            <p className="text-sm text-gray-400 mt-1">Améliorer le référencement</p>
          </a>
          <a
            href="/content"
            className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-200">Modifier le contenu</h3>
            <p className="text-sm text-gray-400 mt-1">Textes et témoignages</p>
          </a>
          <a
            href="/media"
            className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors"
          >
            <Globe className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-200">Gérer les médias</h3>
            <p className="text-sm text-gray-400 mt-1">Images et fichiers</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
