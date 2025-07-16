import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useChat } from '../contexts/SupabaseChatContext';
import { useToast } from '../hooks/useToast';
import AdminHeader from '../components/admin/AdminHeader';
import AdminOverview from '../components/admin/AdminOverview';
import AdminRekberManagement from '../components/admin/AdminRekberManagement';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import AdminGameTopics from '../components/admin/AdminGameTopics';
import AdminRoleManagement from '../components/admin/AdminRoleManagement';
import AdminLogs from '../components/admin/AdminLogs';
import AdminReports from '../components/admin/AdminReports';
import AdminModals from '../components/admin/AdminModals';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MessageCircle, Users, Star } from 'lucide-react';

const Admin: React.FC = () => {
  const { user, isAdmin, isOwner, updateUserId, updateUserRole, createAdmin, getAllUsers, deleteUser, setCustomRole, removeCustomRole } = useAuth();
  const { 
    getRekberGroups, 
    gameTopics, 
    updateGameTopic, 
    deleteGameTopic,
    claimRekberGroup,
    updateRekberStatus,
    addGameTopic
  } = useChat();
  const [showCustomRoleModal, setShowCustomRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rekber' | 'users' | 'topics' | 'roles' | 'logs' | 'reports'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [topicForm, setTopicForm] = useState({ name: '', description: '', icon: '', iconUrl: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '', userId: '' });
  const [customRoleData, setCustomRoleData] = useState({ role: '', color: '#3B82F6' });
  const [filteredRoleUsers, setFilteredRoleUsers] = useState<any[]>([]);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState<string | null>(null);
  const [showDeleteTopicConfirm, setShowDeleteTopicConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUserIdModal, setShowUserIdModal] = useState<string | null>(null);
  const toast = useToast();

  const predefinedRoles = [
    { name: 'VIP', color: '#FFD700', icon: '👑' },
    { name: 'Moderator', color: '#10B981', icon: '🛡️' },
    { name: 'Helper', color: '#3B82F6', icon: '🤝' },
    { name: 'Supporter', color: '#8B5CF6', icon: '💎' },
    { name: 'Veteran', color: '#F59E0B', icon: '⭐' },
    { name: 'Expert', color: '#EF4444', icon: '🔥' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    setFilteredRoleUsers(allUsers);
  };

  // Handler functions
  const handleUpdateUserId = async (username: string, newUserId: string) => {
    const success = await updateUserId(username, newUserId);
    if (success) {
      loadUsers();
      setShowUserIdModal(null);
      toast.success('User ID Diperbarui!', `User ID untuk ${username} berhasil diubah.`);
    } else {
      toast.error('Gagal Memperbarui User ID', 'User ID mungkin sudah digunakan oleh user lain.');
      throw new Error('User ID sudah digunakan');
    }
  };

  const handleUpdateUserRole = async (username: string, role: 'user' | 'admin') => {
    const success = await updateUserRole(username, role);
    if (success) {
      loadUsers();
      toast.success('Role Diperbarui!', `Role ${username} berhasil diubah menjadi ${role}.`);
    } else {
      toast.error('Gagal Memperbarui Role', 'Terjadi kesalahan saat mengubah role user.');
    }
  };

  const handleDeleteUser = async (username: string) => {
    setIsDeleting(true);
    const success = await deleteUser(username);
    if (success) {
      loadUsers();
      toast.success('User Dihapus!', `User ${username} berhasil dihapus dari sistem.`);
    } else {
      toast.error('Gagal Menghapus User', 'Terjadi kesalahan saat menghapus user.');
    }
    setIsDeleting(false);
  };

  const handleCreateAdmin = async () => {
    const success = await createAdmin(adminForm.username, adminForm.password, adminForm.userId);
    if (success) {
      loadUsers();
      setShowCreateAdminModal(false);
      setAdminForm({ username: '', password: '', userId: '' });
      toast.success('Admin Dibuat!', `Admin ${adminForm.username} berhasil dibuat.`);
    } else {
      toast.error('Gagal Membuat Admin', 'Username atau User ID mungkin sudah digunakan.');
    }
  };

  const handleClaimRekberGroup = async (groupId: string) => {
    if (!user) return;
    
    const success = await claimRekberGroup(groupId, user.userId);
    if (success) {
      toast.success('Grup Rekber Diklaim!', 'Anda berhasil mengklaim grup Rekber ini.');
    } else {
      toast.error('Gagal Mengklaim Grup', 'Grup mungkin sudah diklaim oleh admin lain.');
    }
  };

  const handleUpdateRekberStatus = async (groupId: string, status: 'active' | 'success' | 'failed') => {
    await updateRekberStatus(groupId, status);
    const statusText = status === 'success' ? 'berhasil' : status === 'failed' ? 'gagal' : 'aktif';
    toast.info('Status Rekber Diperbarui!', `Status grup Rekber diubah menjadi ${statusText}.`);
  };

  const handleAddTopic = async (name: string, description: string, icon: string, iconUrl?: string) => {
    const success = await addGameTopic(name, description, icon, iconUrl);
    if (success) {
      toast.success('Topic Ditambahkan!', `Game topic ${name} berhasil ditambahkan.`);
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;
    const success = await updateGameTopic(editingTopic.id, {
      name: topicForm.name,
      description: topicForm.description,
      icon: topicForm.icon,
      iconUrl: topicForm.iconUrl
    });
    if (success) {
      setEditingTopic(null);
      setTopicForm({ name: '', description: '', icon: '', iconUrl: '' });
      toast.success('Topic Diperbarui!', 'Game topic berhasil diperbarui.');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    setIsDeleting(true);
    const success = await deleteGameTopic(id);
    if (success) {
      toast.success('Topic Dihapus!', 'Game topic berhasil dihapus.');
    }
    setIsDeleting(false);
  };

  const handleSetCustomRole = async (username: string, role: string, color: string, emoji: string) => {
    const success = await setCustomRole(username, role, color, emoji);
    if (success) {
      loadUsers();
      toast.success('Custom Role Ditetapkan!', `Role ${role} berhasil diberikan.`);
    } else {
      toast.error('Gagal Menetapkan Role', 'Terjadi kesalahan saat menetapkan custom role.');
    }
  };

  const handleRemoveCustomRole = async (username: string) => {
    const success = await removeCustomRole(username);
    if (success) {
      loadUsers();
      toast.success('Custom Role Dihapus!', `Custom role untuk ${username} berhasil dihapus.`);
    } else {
      toast.error('Gagal Menghapus Role', 'Terjadi kesalahan saat menghapus custom role.');
    }
  };

  const handleShowCustomRole = (user: any) => {
    setSelectedUserForRole(user);
    setShowCustomRoleModal(true);
  };

  const rekberGroups = getRekberGroups();

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🛡️</span>
          </div>
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        username={user.username} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <AdminOverview 
            users={users} 
            rekberGroups={rekberGroups} 
            gameTopics={gameTopics} 
          />
        )}

        {activeTab === 'rekber' && (
          <AdminRekberManagement
            rekberGroups={rekberGroups}
            onClaimGroup={handleClaimRekberGroup}
            onUpdateStatus={handleUpdateRekberStatus}
            currentUserId={user.userId}
          />
        )}

        {activeTab === 'users' && (
          <AdminUserManagement
            users={users}
            currentUser={user}
            onUpdateUserId={handleUpdateUserId}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteUser={handleDeleteUser}
            onShowCreateAdmin={() => setShowCreateAdminModal(true)}
            onShowCustomRole={handleShowCustomRole}
            onRemoveCustomRole={handleRemoveCustomRole}
            showDeleteConfirm={showDeleteUserConfirm}
            setShowDeleteConfirm={setShowDeleteUserConfirm}
            isDeleting={isDeleting}
            showUserIdModal={showUserIdModal}
            setShowUserIdModal={setShowUserIdModal}
            onUpdateUserIdModal={handleUpdateUserId}
          />
        )}

        {activeTab === 'topics' && (
          <AdminGameTopics
            gameTopics={gameTopics}
            onAddTopic={handleAddTopic}
            onUpdateTopic={(id: string, updates: any) => updateGameTopic(id, updates)}
            onDeleteTopic={handleDeleteTopic}
            showDeleteConfirm={showDeleteTopicConfirm}
            setShowDeleteConfirm={setShowDeleteTopicConfirm}
            isDeleting={isDeleting}
          />
        )}

        {activeTab === 'roles' && (
          <AdminRoleManagement
            users={users}
            onSetCustomRole={handleSetCustomRole}
            onRemoveCustomRole={handleRemoveCustomRole}
          />
        )}

        {activeTab === 'logs' && <AdminLogs />}

        {activeTab === 'reports' && (
          <AdminReports
            currentUser={user}
            onTakeAction={(reportId, action) => {
              // Handle report action
              console.log('Taking action on report:', reportId, action);
              alert(`Action ${action.actionType} applied successfully!`);
            }}
          />
        )}
      </div>

      <AdminModals
        showCreateAdminModal={showCreateAdminModal}
        showCustomRoleModal={showCustomRoleModal}
        selectedUserForRole={selectedUserForRole}
        onCloseCreateAdmin={() => setShowCreateAdminModal(false)}
        onCloseCustomRole={() => {
          setShowCustomRoleModal(false);
          setSelectedUserForRole(null);
        }}
        onCreateAdmin={handleCreateAdmin}
        onSetCustomRole={handleSetCustomRole}
      />
    </div>
  );
};

export default Admin;