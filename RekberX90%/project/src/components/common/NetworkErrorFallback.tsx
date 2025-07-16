import React from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface NetworkErrorFallbackProps {
  error?: any;
  onRetry?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
}

const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  error,
  onRetry,
  title = 'Koneksi Bermasalah',
  message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  showRetry = true
}) => {
  const getErrorIcon = () => {
    if (error?.code?.includes('NETWORK')) {
      return <WifiOff className="h-12 w-12 text-red-500" />;
    }
    return <AlertCircle className="h-12 w-12 text-orange-500" />;
  };

  const getErrorMessage = () => {
    if (error?.code === 'NETWORK_ERROR_404') {
      return 'Data yang diminta tidak ditemukan.';
    }
    if (error?.code === 'NETWORK_ERROR_500') {
      return 'Server sedang bermasalah. Tim kami sedang memperbaikinya.';
    }
    if (error?.code?.includes('TIMEOUT')) {
      return 'Koneksi timeout. Silakan coba lagi.';
    }
    return message;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6">
        {getErrorIcon()}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {getErrorMessage()}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Coba Lagi</span>
        </button>
      )}

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left max-w-md">
          <summary className="cursor-pointer text-sm text-gray-500">
            Debug Info
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default NetworkErrorFallback;