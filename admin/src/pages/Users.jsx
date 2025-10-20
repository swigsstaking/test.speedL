import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, sitesAPI } from '../services/api';
import { Users as UsersIcon, Plus, Trash2, Edit2, X, Save, Shield, UserCheck, Mail, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Users() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'editor',
    sites: [],
  });

  // Récupérer les utilisateurs
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.getAll,
  });

  // Récupérer les sites
  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesAPI.getAll,
  });

  // Créer un utilisateur
  const createMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Utilisateur créé avec succès');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  // Mettre à jour un utilisateur
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Utilisateur mis à jour');
      setShowModal(false);
      setEditingUser(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  // Supprimer un utilisateur
  const deleteMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Utilisateur supprimé');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'editor',
      sites: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      updateMutation.mutate({ id: editingUser._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      sites: user.sites.map(s => s._id),
    });
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteMutation.mutate(userId);
    }
  };

  const handleSiteToggle = (siteId) => {
    setFormData(prev => ({
      ...prev,
      sites: prev.sites.includes(siteId)
        ? prev.sites.filter(id => id !== siteId)
        : [...prev.sites, siteId]
    }));
  };

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Utilisateurs</h1>
          <p className="text-gray-400 mt-1">Gérer les utilisateurs et leurs accès</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingUser(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Liste des utilisateurs - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.data?.map((user) => (
          <div key={user._id} className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-primary-600/50 transition-colors">
            {/* Header de la card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-gray-100 font-semibold">{user.name}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Rôle */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                {user.role === 'admin' ? 'Administrateur' : 'Éditeur'}
              </span>
            </div>

            {/* Sites assignés */}
            <div className="mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Sites assignés</p>
              <div className="flex flex-wrap gap-1.5">
                {user.role === 'admin' ? (
                  <span className="text-xs text-gray-500 italic">Tous les sites</span>
                ) : user.sites?.length > 0 ? (
                  user.sites.map(site => (
                    <span key={site._id} className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded border border-dark-600">
                      {site.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">Aucun site</span>
                )}
              </div>
            </div>

            {/* Statut */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                user.isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {user.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-dark-700">
              <button
                onClick={() => handleEdit(user)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => handleDelete(user._id)}
                className="flex items-center justify-center px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun utilisateur */}
      {users?.data?.length === 0 && (
        <div className="text-center py-12 bg-dark-800 border border-dark-700 rounded-lg">
          <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Aucun utilisateur</p>
        </div>
      )}

      {/* Modal Créer/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="flex justify-between items-center p-6 border-b border-dark-700">
              <h2 className="text-xl font-bold text-gray-100">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors"
                  placeholder="jean@example.com"
                  required
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Mot de passe {editingUser && <span className="text-gray-500 text-xs">(laisser vide pour ne pas changer)</span>}
                  </div>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required={!editingUser}
                  minLength={8}
                />
                {!editingUser && (
                  <p className="text-xs text-gray-500 mt-1.5">Minimum 8 caractères</p>
                )}
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rôle *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'editor' })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.role === 'editor'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-500'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Éditeur</div>
                      <div className="text-xs opacity-75">Accès limité</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.role === 'admin'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                        : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-dark-500'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Admin</div>
                      <div className="text-xs opacity-75">Accès total</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sites (seulement pour les editors) */}
              {formData.role === 'editor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sites assignés
                  </label>
                  <div className="space-y-2 bg-dark-700 border border-dark-600 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {sites?.data?.map((site) => (
                      <label key={site._id} className="flex items-center gap-3 cursor-pointer hover:bg-dark-600 p-2.5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.sites.includes(site._id)}
                          onChange={() => handleSiteToggle(site._id)}
                          className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-500 rounded focus:ring-2 focus:ring-primary-600"
                        />
                        <span className="text-gray-300 text-sm">{site.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    L'utilisateur pourra uniquement modifier les sites sélectionnés
                  </p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-gray-300 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
