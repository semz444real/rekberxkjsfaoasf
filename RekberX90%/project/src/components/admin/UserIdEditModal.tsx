import React, { useState, useEffect } from 'react';
import { X, User, AlertCircle } from 'lucide-react';

interface UserIdEditModalProps {
  isOpen: boolean;
  username: string;
  currentUserId: string;
  onClose: () => void;
  onSave: (username: string, newUserId: string) => void;
}

const UserIdEditModal: React.FC<UserIdEditModalProps> = ({
  isOpen,
  username,
  currentUserId,
  onClose,
  onSave
}) => {
  const [newUserId, setNewUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewUserId(currentUserId);
      setError('');
    }
  }, [isOpen, currentUserId]);

  const validateUserId = (userId: string): string | null => {
    if (!userId.trim()) {
      return 'User ID tidak boleh kosong';
    }
    
    if (userId.length < 1) {
      return 'User ID minimal 1 karakter';
    }
    
    if (userId.length > 10) {
      return 'User ID maksimal 10 karakter';
    }
    
    if (!/^[0-9]+$/.test(userId)) {
      return 'User ID hanya boleh berisi angka';
    }
    
    return null;
  };

  const handleSave = async () => {
    const validation = validateUserId(newUserId);
    if (validation) {
      setError(validation);
      return;
    }

    if (newUserId === currentUserId) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(username, newUserId.trim());
      onClose();
    } catch (err) {
      setError('User ID sudah digunakan atau terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit User ID</h3>
                <p className="text-gray-600">User: {username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current User ID
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border">
                <span className="font-mono text-gray-900">{currentUserId}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New User ID
              </label>
              <input
                type="text"
                value={newUserId}
                onChange={(e) => {
                  setNewUserId(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyPress}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono ${
                  error 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="e.g., 123456"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Ketentuan User ID:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Minimal 1 karakter, maksimal 10 karakter</li>
                <li>• Hanya boleh berisi angka (0-9)</li>
                <li>• Tidak boleh sama dengan User ID lain</li>
                <li>• Contoh: 1, 99, 123456, 200001, 971968</li>
                <li>• <strong>ID pendek sangat berharga!</strong> (1, 2, 3, dll)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !newUserId.trim() || newUserId === currentUserId}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIdEditModal;