import React from 'react';
import { Shield, Users, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AdminRekberManagementProps {
  rekberGroups: any[];
  onClaimGroup: (groupId: string) => void;
  onUpdateStatus: (groupId: string, status: 'active' | 'success' | 'failed') => void;
  currentUserId: string;
}

const AdminRekberManagement: React.FC<AdminRekberManagementProps> = ({
  rekberGroups,
  onClaimGroup,
  onUpdateStatus,
  currentUserId
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Rekber Management</h2>
        </div>
        <p className="text-gray-600">
          Kelola grup Rekber dan pantau status transaksi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {rekberGroups.filter(g => g.status === 'active').length}
              </p>
              <p className="text-gray-600 text-sm">Active</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {rekberGroups.filter(g => g.status === 'completed').length}
              </p>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {rekberGroups.filter(g => !g.claimedBy).length}
              </p>
              <p className="text-gray-600 text-sm">Unclaimed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rekberGroups.length}</p>
              <p className="text-gray-600 text-sm">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rekber Groups List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Rekber Groups</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {rekberGroups.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada grup Rekber</p>
            </div>
          ) : (
            rekberGroups.map((group) => (
              <div key={group.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="font-bold text-gray-900">{group.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(group.status || 'active')}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(group.status || 'active')}
                          <span className="capitalize">{group.status || 'active'}</span>
                        </div>
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Game:</strong> {group.game}</p>
                      <p><strong>Participants:</strong> {group.participants?.length || 0} users</p>
                      <p><strong>Messages:</strong> {group.messages?.length || 0}</p>
                      <p><strong>Created:</strong> {group.createdAt ? new Date(group.createdAt).toLocaleString('id-ID') : 'Unknown'}</p>
                      {group.claimedBy && (
                        <p><strong>Claimed by:</strong> Admin {group.claimedBy}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {!group.claimedBy ? (
                      <button
                        onClick={() => onClaimGroup(group.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Claim Group
                      </button>
                    ) : group.claimedBy === currentUserId ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => onUpdateStatus(group.id, 'success')}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Mark Success
                        </button>
                        <button
                          onClick={() => onUpdateStatus(group.id, 'failed')}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Mark Failed
                        </button>
                      </div>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                        Claimed by other admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRekberManagement;