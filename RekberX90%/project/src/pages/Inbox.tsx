import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useChat } from '../contexts/SupabaseChatContext';
import { useToast } from '../hooks/useToast';
import { Check, X, Clock, Users, Shield } from 'lucide-react';

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const { invites, acceptRekberInvite, rejectRekberInvite } = useChat();
  const toast = useToast();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Silakan login untuk melihat inbox</p>
        </div>
      </div>
    );
  }

  const userInvites = invites.filter(invite => invite.toUserId === user.userId);
  const pendingInvites = userInvites.filter(invite => invite.status === 'pending');
  const processedInvites = userInvites.filter(invite => invite.status !== 'pending');

  const handleAcceptInvite = (inviteId: string, fromUsername: string) => {
    acceptRekberInvite(inviteId);
    toast.success(
      'Undangan Rekber Diterima!', 
      `Grup Rekber dengan ${fromUsername} telah dibuat. Silakan cek di tab Chat Rekber.`
    );
  };

  const handleRejectInvite = (inviteId: string, fromUsername: string) => {
    rejectRekberInvite(inviteId);
    toast.info(
      'Undangan Rekber Ditolak', 
      `Undangan dari ${fromUsername} telah ditolak.`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inbox Rekber</h1>
              <p className="text-gray-600">Undangan transaksi Rekber</p>
            </div>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                Menunggu Konfirmasi ({pendingInvites.length})
              </h2>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-orange-600" />
                          </div>
                          <h3 className="font-bold text-gray-900">Undangan Rekber {invite.game}</h3>
                        </div>
                        <p className="text-gray-700 mb-3">
                          <span className="font-semibold">{invite.fromUserId} {invite.fromUsername}</span> mengundang Anda untuk transaksi Rekber
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(invite.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex space-x-3 ml-4">
                        <button
                          onClick={() => handleAcceptInvite(invite.id, invite.fromUsername)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          <span>Terima</span>
                        </button>
                        <button
                          onClick={() => handleRejectInvite(invite.id, invite.fromUsername)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processed Invites */}
          {processedInvites.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Riwayat</h2>
              <div className="space-y-4">
                {processedInvites.map((invite) => (
                  <div key={invite.id} className={`border rounded-xl p-6 ${
                    invite.status === 'accepted' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Rekber {invite.game} - {invite.fromUsername}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(invite.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        invite.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invite.status === 'accepted' ? 'Diterima' : 'Ditolak'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {userInvites.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Undangan</h3>
              <p className="text-gray-500">
                Undangan Rekber akan muncul di sini ketika ada yang mengundang Anda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;