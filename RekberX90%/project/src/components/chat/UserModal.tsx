import React, { useState } from 'react';
import { User, Shield, MessageCircle, X, AlertTriangle, VolumeX, Ban } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: { id: string; username: string } | null;
  currentUser: any;
  isAdmin: boolean;
  onInviteRekber: () => void;
  onPrivateChat: () => void;
  onReport: (reason: string, description: string) => void;
  onMute: (duration: number) => void;
  onBan: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  selectedUser,
  currentUser,
  isAdmin,
  onInviteRekber,
  onPrivateChat,
  onReport,
  onMute,
  onBan
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAdminActions, setShowAdminActions] = useState(false);
  const [showMuteConfirm, setShowMuteConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportForm, setReportForm] = useState({
    reason: 'spam',
    description: ''
  });
  const [muteDuration, setMuteDuration] = useState(300); // 5 minutes default

  const reportReasons = [
    { value: 'scam', label: 'Penipuan/Scam' },
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Pelecehan/Harassment' },
    { value: 'inappropriate', label: 'Konten Tidak Pantas' },
    { value: 'other', label: 'Lainnya' }
  ];

  const handleReport = () => {
    if (!reportForm.description.trim()) {
      alert('Mohon berikan deskripsi laporan');
      return;
    }
    onReport(reportForm.reason, reportForm.description);
    setShowReportModal(false);
    setReportForm({ reason: 'spam', description: '' });
    onClose();
  };

  const handleMute = () => {
    setShowMuteConfirm(true);
  };

  const handleBan = () => {
    setShowBanConfirm(true);
  };

  const handleConfirmMute = () => {
    if (muteDuration < 1) {
      alert('Durasi mute minimal 1 detik');
      return;
    }
    setIsProcessing(true);
    onMute(muteDuration);
    setShowMuteConfirm(false);
    setShowAdminActions(false);
    setIsProcessing(false);
    onClose();
  };

  const handleConfirmBan = () => {
    setIsProcessing(true);
    onBan();
    setShowBanConfirm(false);
    setShowAdminActions(false);
    setIsProcessing(false);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} detik`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam`;
    return `${Math.floor(seconds / 86400)} hari`;
  };

  if (!isOpen || !selectedUser) return null;

  // Report Modal
  if (showReportModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Laporkan User</h3>
                <p className="text-gray-600">{selectedUser.username}</p>
              </div>
            </div>
            <button
              onClick={() => setShowReportModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alasan Laporan
              </label>
              <select
                value={reportForm.reason}
                onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {reportReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi Detail
              </label>
              <textarea
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
                placeholder="Jelaskan detail masalah yang terjadi..."
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowReportModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleReport}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              Kirim Laporan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Actions Modal
  if (showAdminActions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Admin Actions</h3>
                <p className="text-gray-600">{selectedUser.username}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdminActions(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Mute Section */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <VolumeX className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900">Mute User</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durasi (detik)
                  </label>
                  <input
                    type="number"
                    value={muteDuration}
                    onChange={(e) => setMuteDuration(parseInt(e.target.value) || 300)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Durasi: {formatDuration(muteDuration)}
                  </p>
                </div>
                <button
                  onClick={handleMute}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Mute User
                </button>
              </div>
            </div>

            {/* Ban Section */}
            <div className="border border-red-200 rounded-xl p-4 bg-red-50">
              <div className="flex items-center space-x-2 mb-3">
                <Ban className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Ban User (Permanent)</h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                User akan di-ban permanent dan tidak bisa mengakses chat.
              </p>
              <button
                onClick={handleBan}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Ban Permanent
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowAdminActions(false)}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main User Modal
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {selectedUser.username}
          </h3>
          <p className="text-gray-600">Pilih aksi yang ingin dilakukan</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onInviteRekber}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Shield className="h-5 w-5" />
            <span>Invite Rekber</span>
          </button>
          
          <button
            onClick={onPrivateChat}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Chat Pribadi</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Report</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAdminActions(true)}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Shield className="h-5 w-5" />
              <span>Admin Actions</span>
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

      {/* Mute Confirmation Modal */}
      <ConfirmModal
        isOpen={showMuteConfirm}
        onClose={() => setShowMuteConfirm(false)}
        onConfirm={handleConfirmMute}
        title="Mute User"
        message={`Yakin ingin mute user "${selectedUser?.username}" selama ${formatDuration(muteDuration)}? User tidak akan bisa mengirim pesan selama periode ini.`}
        confirmText="Mute User"
        cancelText="Batal"
        type="warning"
        isLoading={isProcessing}
      />

      {/* Ban Confirmation Modal */}
      <ConfirmModal
        isOpen={showBanConfirm}
        onClose={() => setShowBanConfirm(false)}
        onConfirm={handleConfirmBan}
        title="Ban User Permanent"
        message={`Yakin ingin ban permanent user "${selectedUser?.username}"? User akan diblokir secara permanen dan tidak bisa mengakses chat. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ban Permanent"
        cancelText="Batal"
        type="danger"
        isLoading={isProcessing}
      />
    </>
  );
};

export default UserModal;