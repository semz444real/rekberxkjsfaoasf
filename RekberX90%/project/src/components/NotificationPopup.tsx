import React, { useState, useEffect } from 'react';
import { X, Clock, Users, Shield } from 'lucide-react';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  game: string;
  seller: string;
  buyer: string;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isOpen,
  onClose,
  onAccept,
  game,
  seller,
  buyer
}) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(30);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Undangan Rekber</h3>
              <p className="text-sm text-gray-500">Transaksi Aman</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Detail Transaksi</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Game:</span>
                <span className="font-semibold text-gray-900">{game}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Penjual:</span>
                <span className="font-semibold text-gray-900">{seller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pembeli:</span>
                <span className="font-semibold text-gray-900">{buyer}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Rekber</strong> adalah sistem keamanan transaksi dimana admin akan membantu memastikan transaksi berjalan aman untuk kedua belah pihak.
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 text-orange-600 mb-3">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">Tutup otomatis dalam {timeLeft} detik</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tolak
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Terima Undangan
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;