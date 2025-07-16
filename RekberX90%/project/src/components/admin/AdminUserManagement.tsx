import React from 'react';
import { Users, Edit2, Trash2, Shield, Crown, Plus } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import UserIdEditModal from './UserIdEditModal';

interface AdminUserManagementProps {
  users: any[];
  currentUser: any;
  onUpdateUserId: (username: string, newUserId: string) => void;
  onUpdateUserRole: (username: string, role: 'user' | 'admin') => void;
  onDeleteUser: (username: string) => void;
  onShowCreateAdmin: () => void;
  onShowCustomRole: (user: any) => void;
  onRemoveCustomRole: (username: string) => void;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (username: string | null) => void;
  isDeleting: boolean;
  showUserIdModal: string | null;
  setShowUserIdModal: (username: string | null) => void;
  onUpdateUserIdModal: (username: string, newUserId: string) => void;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  currentUser,
  onUpdateUserId,
  onUpdateUserRole,
  onDeleteUser,
  onShowCreateAdmin,
  onShowCustomRole,
  onRemoveCustomRole,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting,
  showUserIdModal,
  setShowUserIdModal,
  onUpdateUserIdModal
}) => {
  const getRoleBadge = (user: any) => {
    if (user.customRole) {
      return (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: user.customRoleColor }}
        >
          ⭐ {user.customRole}
        </span>
      );
    }
    
    switch (user.role) {
      case 'owner':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">👑 Owner</span>;
      case 'admin':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">🛡️ Admin</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">👤 User</span>;
    }
  };

  const handleUserIdUpdate = (username: string) => {
    setShowUserIdModal(username);
  };

  const handleRoleUpdate = (username: string, currentRole: string) => {
    if (currentRole === 'owner') {
      alert('Cannot change owner role');
      return;
    }
    
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`Change role to ${newRole}?`)) {
      onUpdateUserRole(username, newRole);
    }
  };

  const handleDeleteUser = (username: string, role: string) => {
    if (role === 'owner') {
      alert('Cannot delete owner');
      return;
    }
    
    setShowDeleteConfirm(username);
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteUser(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600">Kelola pengguna dan role mereka</p>
            </div>
          </div>
          <button
            onClick={onShowCreateAdmin}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Create Admin</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-gray-600 text-sm">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-gray-600 text-sm">Admins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Crown className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'owner').length}
              </p>
              <p className="text-gray-600 text-sm">Owners</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.customRole).length}
              </p>
              <p className="text-gray-600 text-sm">Custom Roles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">All Users</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-600">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        {user.username === currentUser?.username && (
                          <p className="text-xs text-blue-600">You</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {user.userId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.joinDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserIdUpdate(user.username)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User ID"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      {user.role !== 'owner' && (
                        <button
                          onClick={() => handleRoleUpdate(user.username, user.role)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onShowCustomRole(user)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Custom Role"
                      >
                        <Crown className="h-4 w-4" />
                      </button>
                      
                      {user.customRole && (
                        <button
                          onClick={() => onRemoveCustomRole(user.username)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Remove Custom Role"
                        >
                          <Crown className="h-4 w-4" />
                        </button>
                      )}
                      
                      {user.role !== 'owner' && user.username !== currentUser?.username && (
                        <button
                          onClick={() => handleDeleteUser(user.username, user.role)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus User"
        message={`Yakin ingin menghapus user "${showDeleteConfirm}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data user termasuk pesan dan riwayat transaksi.`}
        confirmText="Hapus User"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />

      {/* User ID Edit Modal */}
      <UserIdEditModal
        isOpen={showUserIdModal !== null}
        username={showUserIdModal || ''}
        currentUserId={users.find(u => u.username === showUserIdModal)?.userId || ''}
        onClose={() => setShowUserIdModal(null)}
        onSave={onUpdateUserIdModal}
      />
    </>
  );
};

export default AdminUserManagement;