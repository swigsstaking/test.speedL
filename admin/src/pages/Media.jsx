import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaAPI } from '../services/api';
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Media = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: mediaAPI.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: mediaAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
      toast.success('Fichier supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await mediaAPI.upload(formData);
      queryClient.invalidateQueries(['media']);
      toast.success('Fichier uploadé avec succès');
      e.target.value = ''; // Reset input
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      deleteMutation.mutate(filename);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copiée !');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Médiathèque</h1>
          <p className="text-gray-400 mt-2">Gérez vos images et fichiers</p>
        </div>
        <label className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors cursor-pointer">
          <Upload className="w-5 h-5" />
          <span>{uploading ? 'Upload en cours...' : 'Uploader un fichier'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Info */}
      <div className="mb-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
        <p className="text-sm text-blue-400">
          <strong>Formats acceptés:</strong> JPEG, PNG, GIF, WebP, SVG
          <br />
          <strong>Taille maximale:</strong> 5 MB par fichier
        </p>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : mediaData?.data?.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucun fichier uploadé</p>
          <p className="text-gray-500 text-sm mt-2">Commencez par uploader votre premier fichier</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaData?.data?.map((file) => (
            <div
              key={file.filename}
              className="group relative bg-dark-800 border border-dark-700 rounded-lg overflow-hidden hover:border-primary-600 transition-all"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-dark-900 flex items-center justify-center overflow-hidden">
                <img
                  src={file.url}
                  alt={file.originalName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* File Info */}
              <div className="p-3">
                <p className="text-sm text-gray-300 truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleCopyUrl(file.url)}
                  className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  title="Copier l'URL"
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(file.filename)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Media;
