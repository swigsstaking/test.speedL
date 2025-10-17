import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { webhookAPI } from '../services/api';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RebuildButton = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const rebuildMutation = useMutation({
    mutationFn: webhookAPI.rebuildSite,
    onSuccess: () => {
      setStatus('success');
      toast.success('Site en cours de mise à jour ! (30-60 secondes)', {
        duration: 5000,
      });
      setTimeout(() => setStatus('idle'), 5000);
    },
    onError: (error) => {
      setStatus('error');
      toast.error(error.message || 'Erreur lors de la mise à jour');
      setTimeout(() => setStatus('idle'), 3000);
    },
  });

  const handleRebuild = () => {
    setStatus('loading');
    rebuildMutation.mutate();
  };

  return (
    <button
      onClick={handleRebuild}
      disabled={status === 'loading'}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
        ${status === 'loading' 
          ? 'bg-blue-600/50 text-blue-200 cursor-wait' 
          : status === 'success'
          ? 'bg-green-600 text-white'
          : status === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-primary-600 hover:bg-primary-700 text-white'
        }
      `}
    >
      {status === 'loading' && (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Mise à jour en cours...</span>
        </>
      )}
      {status === 'success' && (
        <>
          <Check className="w-4 h-4" />
          <span>Mise à jour lancée !</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Erreur</span>
        </>
      )}
      {status === 'idle' && (
        <>
          <RefreshCw className="w-4 h-4" />
          <span>Publier les modifications</span>
        </>
      )}
    </button>
  );
};

export default RebuildButton;
