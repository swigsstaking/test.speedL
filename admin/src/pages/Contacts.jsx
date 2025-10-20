import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSite } from '../context/SiteContext';
import { contactAPI } from '../services/api';
import { Mail, Phone, Gift, Trash2, CheckCircle, Clock, MessageSquare, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Contacts = () => {
  const { currentSite } = useSite();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // all, contact, gift-card
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, read, replied, archived

  // Fetch contacts
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', currentSite?._id, filter, statusFilter],
    queryFn: () => {
      const params = {};
      if (currentSite?._id) params.siteId = currentSite._id;
      if (filter !== 'all') params.type = filter;
      if (statusFilter !== 'all') params.status = statusFilter;
      return contactAPI.getAll(params);
    },
    enabled: !!currentSite,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => contactAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => contactAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-gray-200 text-gray-600',
    };
    const labels = {
      new: 'Nouveau',
      read: 'Lu',
      replied: 'Répondu',
      archived: 'Archivé',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Sélectionnez un site pour voir les contacts</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Contacts & Demandes</h1>
        <p className="text-gray-400 mt-2">Gérez les formulaires reçus depuis votre site</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
          >
            <option value="all">Tous</option>
            <option value="contact">Contacts</option>
            <option value="gift-card">Bons cadeaux</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-100 focus:outline-none focus:border-primary-600"
          >
            <option value="all">Tous</option>
            <option value="new">Nouveaux</option>
            <option value="read">Lus</option>
            <option value="replied">Répondus</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      {/* Contacts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : contacts?.data?.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 border border-dark-700 rounded-lg">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Aucun contact pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts?.data?.map((contact) => (
            <div
              key={contact._id}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-dark-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.type === 'gift-card' ? 'bg-primary-900 text-primary-400' : 'bg-blue-900 text-blue-400'
                  }`}>
                    {contact.type === 'gift-card' ? <Gift className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">{contact.name}</h3>
                    <p className="text-sm text-gray-400">{formatDate(contact.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(contact.status)}
                  {!contact.emailSent && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Email non envoyé
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary-400">
                    {contact.email}
                  </a>
                </div>
                {contact.phone && (
                  <div className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <a href={`tel:${contact.phone}`} className="hover:text-primary-400">
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Gift Card Details */}
              {contact.type === 'gift-card' && contact.giftCard && (
                <div className="bg-dark-900 border border-dark-700 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Détails du bon cadeau</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Montant:</span>
                      <span className="text-gray-100 ml-2 font-semibold">CHF {contact.giftCard.amount}.-</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Bénéficiaire:</span>
                      <span className="text-gray-100 ml-2">{contact.giftCard.recipientName}</span>
                    </div>
                    {contact.giftCard.recipientEmail && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Email bénéficiaire:</span>
                        <span className="text-gray-100 ml-2">{contact.giftCard.recipientEmail}</span>
                      </div>
                    )}
                    {contact.giftCard.deliveryDate && (
                      <div className="col-span-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-500">Livraison:</span>
                        <span className="text-gray-100 ml-2">
                          {new Date(contact.giftCard.deliveryDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              {contact.message && (
                <div className="bg-dark-900 border border-dark-700 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Message</h4>
                  <p className="text-gray-400 whitespace-pre-wrap">{contact.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                <div className="flex items-center space-x-2">
                  <select
                    value={contact.status}
                    onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                    className="px-3 py-1.5 bg-dark-900 border border-dark-700 rounded text-sm text-gray-300 focus:outline-none focus:border-primary-600"
                  >
                    <option value="new">Nouveau</option>
                    <option value="read">Lu</option>
                    <option value="replied">Répondu</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDelete(contact._id)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
