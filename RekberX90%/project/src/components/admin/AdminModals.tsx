import React, { useState } from 'react';
import { X, User, Shield, Crown, Palette } from 'lucide-react';

interface AdminModalsProps {
  showCreateAdminModal: boolean;
  showCustomRoleModal: boolean;
  selectedUserForRole: any;
  onCloseCreateAdmin: () => void;
  onCloseCustomRole: () => void;
  onCreateAdmin: (username: string, password: string, userId: string) => void;
  onSetCustomRole: (username: string, role: string, color: string) => void;
}

const AdminModals: React.FC<AdminModalsProps> = ({
  showCreateAdminModal,
  showCustomRoleModal,
  selectedUserForRole,
  onCloseCreateAdmin,
  onCloseCustomRole,
  onCreateAdmin,
  onSetCustomRole
}) => {
  const [createAdminForm, setCreateAdminForm] = useState({
    username: '',
    password: '',
    userId: ''
  });

  const [customRoleForm, setCustomRoleForm] = useState({
    role: '',
    color: '#8B5CF6',
    emoji: '⭐'
  });

  const predefinedRoles = [
    { name: 'VIP Member', color: '#8B5CF6', emoji: '👑' },
    { name: 'Trusted Seller', color: '#10B981', emoji: '🛡️' },
    { name: 'Premium Buyer', color: '#F59E0B', emoji: '💎' },
    { name: 'Community Helper', color: '#3B82F6', emoji: '🤝' },
    { name: 'Game Expert', color: '#EF4444', emoji: '🔥' },
    { name: 'Beta Tester', color: '#6366F1', emoji: '🧪' }
  ];

  const quickEmojis = [
    '👑', '🛡️', '💎', '⭐', '🔥', '🚀', '💯', '🎯', '🏆', '🎮',
    '⚡', '🌟', '💫', '🎪', '🎭', '🎨', '🤝', '💪', '🧠', '🦄'
  ];

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAdmin(createAdminForm.username, createAdminForm.password, createAdminForm.userId);
    setCreateAdminForm({ username: '', password: '', userId: '' });
  };

  const handleSetCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserForRole) {
      onSetCustomRole(selectedUserForRole.username, customRoleForm.role, customRoleForm.color, customRoleForm.emoji);
      setCustomRoleForm({ role: '', color: '#8B5CF6', emoji: '⭐' });
    }
  };

  const selectPredefinedRole = (role: { name: string; color: string; emoji: string }) => {
    setCustomRoleForm({ role: role.name, color: role.color, emoji: role.emoji });
  };

  return (
    <>
      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Create Admin</h3>
                  <p className="text-gray-600">Add new admin user</p>
                </div>
              </div>
              <button
                onClick={onCloseCreateAdmin}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={createAdminForm.username}
                    onChange={(e) => setCreateAdminForm({ ...createAdminForm, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Admin username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={createAdminForm.password}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Admin password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={createAdminForm.userId}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, userId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., 200001"
                  required
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm">
                  <strong>Admin privileges:</strong> Can manage users, claim Rekber groups, and access admin panel.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onCloseCreateAdmin}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Role Modal */}
      {showCustomRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Set Custom Role</h3>
                  <p className="text-gray-600">For {selectedUserForRole.username}</p>
                </div>
              </div>
              <button
                onClick={onCloseCustomRole}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Emoji Resources Link */}
            <div className="mb-4 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="text-gray-600">Need more emojis?</span>
                <div className="flex space-x-3">
                  <a 
                    href="https://emojipedia.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                  >
                    <span>📚</span>
                    <span>Emojipedia</span>
                  </a>
                  <a 
                    href="https://getemoji.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                  >
                    <span>🎯</span>
                    <span>GetEmoji</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Predefined Roles */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Select</h4>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {predefinedRoles.map((role) => (
                  <button
                    key={role.name}
                    onClick={() => selectPredefinedRole(role)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{role.emoji}</span>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {role.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSetCustomRole} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Emoji
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={customRoleForm.emoji}
                      onChange={(e) => setCustomRoleForm({ ...customRoleForm, emoji: e.target.value.slice(0, 2) })}
                      className="w-20 px-3 py-2 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="⭐"
                      maxLength={2}
                    />
                    <span className="text-gray-500 text-sm">Choose an emoji for the role</span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Quick select:</p>
                    <div className="grid grid-cols-10 gap-1 max-h-20 overflow-y-auto">
                      {quickEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCustomRoleForm({ ...customRoleForm, emoji })}
                          className="w-8 h-8 text-lg hover:bg-purple-100 rounded transition-colors flex items-center justify-center"
                          title={`Select ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={customRoleForm.role}
                  onChange={(e) => setCustomRoleForm({ ...customRoleForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., VIP Member"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Color
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Palette className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="color"
                      value={customRoleForm.color}
                      onChange={(e) => setCustomRoleForm({ ...customRoleForm, color: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div 
                    className="w-12 h-12 rounded-xl border-2 border-gray-200"
                    style={{ backgroundColor: customRoleForm.color }}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-purple-800 text-sm mb-2">
                  <strong>Preview:</strong>
                </p>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{selectedUserForRole.username}</span>
                  {customRoleForm.role && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: customRoleForm.color }}
                    >
                      {customRoleForm.emoji} {customRoleForm.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onCloseCustomRole}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  Set Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminModals;