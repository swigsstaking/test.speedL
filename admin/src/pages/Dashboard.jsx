import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Bienvenue {user?.name || 'Admin'} !
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-4">
          🎉 Connexion réussie !
        </h2>
        <p className="text-gray-300 mb-4">
          Le CMS SWIGS fonctionne correctement.
        </p>
        
        {user && (
          <div className="mt-4 p-4 bg-dark-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Informations utilisateur :</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p><span className="font-medium text-gray-300">Nom :</span> {user.name}</p>
              <p><span className="font-medium text-gray-300">Email :</span> {user.email}</p>
              <p><span className="font-medium text-gray-300">Rôle :</span> {user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
