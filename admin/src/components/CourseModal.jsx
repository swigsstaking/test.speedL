import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI } from '../services/api';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseModal = ({ course, siteId, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    number: '',
    description: '',
    category: 'sensibilisation',
    price: { amount: 0, currency: 'CHF', display: '' },
    duration: '',
    dates: [],
    status: 'active',
  });

  useEffect(() => {
    if (course) {
      setFormData({
        ...course,
        dates: course.dates.map(d => ({
          ...d,
          date: new Date(d.date).toISOString().split('T')[0],
        })),
      });
    }
  }, [course]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (course) {
        return coursesAPI.update(course._id, data);
      }
      return coursesAPI.create({ ...data, site: siteId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      toast.success(course ? 'Cours modifié' : 'Cours créé');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update price display
    const data = {
      ...formData,
      price: {
        ...formData.price,
        display: `CHF ${formData.price.amount}.-`,
      },
    };
    
    mutation.mutate(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('price.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        price: { ...prev.price, [field]: field === 'amount' ? Number(value) : value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addDate = () => {
    setFormData(prev => ({
      ...prev,
      dates: [...prev.dates, { day: '', date: '', time: '' }],
    }));
  };

  const removeDate = (index) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index),
    }));
  };

  const updateDate = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.map((date, i) =>
        i === index ? { ...date, [field]: value } : date
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <h2 className="text-2xl font-bold text-gray-100">
            {course ? 'Modifier le cours' : 'Nouveau cours'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title & Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Numéro</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="input"
                placeholder="N°609"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
              required
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Catégorie</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                <option value="sensibilisation">Sensibilisation</option>
                <option value="moto">Moto/Scooter</option>
                <option value="secours">Premiers secours</option>
                <option value="theorie">Théorie</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="label">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="active">Actif</option>
                <option value="full">Complet</option>
                <option value="cancelled">Annulé</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prix (CHF) *</label>
              <input
                type="number"
                name="price.amount"
                value={formData.price.amount}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Durée *</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input"
                placeholder="2 soirées"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Dates</label>
              <button
                type="button"
                onClick={addDate}
                className="btn-secondary text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.dates.map((date, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={date.day}
                    onChange={(e) => updateDate(index, 'day', e.target.value)}
                    className="input flex-1"
                    placeholder="Jour (ex: Mercredi)"
                  />
                  <input
                    type="date"
                    value={date.date}
                    onChange={(e) => updateDate(index, 'date', e.target.value)}
                    className="input flex-1"
                  />
                  <input
                    type="text"
                    value={date.time}
                    onChange={(e) => updateDate(index, 'time', e.target.value)}
                    className="input flex-1"
                    placeholder="Heure (ex: 18h25)"
                  />
                  <button
                    type="button"
                    onClick={() => removeDate(index)}
                    className="p-2 text-red-400 hover:bg-dark-800 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary"
            >
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
