import React, { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

interface AdminGameTopicsProps {
  gameTopics: any[];
  onAddTopic: (name: string, description: string, icon: string) => void;
  onUpdateTopic: (id: string, updates: any) => void;
  onDeleteTopic: (id: string) => void;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (topicId: string | null) => void;
  isDeleting: boolean;
}

const AdminGameTopics: React.FC<AdminGameTopicsProps> = ({
  gameTopics,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    iconUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopic) {
      onUpdateTopic(editingTopic.id, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        iconUrl: formData.iconUrl
      });
      setEditingTopic(null);
    } else {
      onAddTopic(formData.name, formData.description, formData.icon, formData.iconUrl || undefined);
      setShowAddForm(false);
    }
    setFormData({ name: '', description: '', icon: '', iconUrl: '' });
  };

  const handleEdit = (topic: any) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description,
      icon: topic.icon,
      iconUrl: topic.iconUrl || ''
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTopic(null);
    setFormData({ name: '', description: '', icon: '', iconUrl: '' });
  };

  const handleToggleActive = (topic: any) => {
    onUpdateTopic(topic.id, { isActive: !topic.isActive });
  };

  const handleDelete = (topic: any) => {
    setShowDeleteConfirm(topic.id);
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteTopic(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const getDeleteTopicName = () => {
    if (!showDeleteConfirm) return '';
    const topic = gameTopics.find(t => t.id === showDeleteConfirm);
    return topic?.name || '';
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Game Topics</h2>
              <p className="text-gray-600">Kelola kategori game dan chat room</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Add Topic</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingTopic ? 'Edit Topic' : 'Add New Topic'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Game Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mobile Legends"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon (2 characters)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value.slice(0, 2) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ML"
                  maxLength={2}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custom Icon URL (Optional)
              </label>
              <input
                type="url"
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/icon.png"
              />
              <p className="text-sm text-gray-500 mt-1">
                Jika diisi, akan menggantikan icon text dengan gambar dari URL ini
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Diamond, Skin, Akun"
                required
              />
            </div>
            
            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm mb-3">
                <strong>Preview:</strong>
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {formData.iconUrl ? (
                    <img
                      src={formData.iconUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to text icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-white font-bold text-xl"
                    style={{ display: formData.iconUrl ? 'none' : 'block' }}
                  >
                    {formData.icon || '?'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{formData.name || 'Game Name'}</h4>
                  <p className="text-gray-600">{formData.description || 'Description'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                {editingTopic ? 'Update Topic' : 'Add Topic'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameTopics.map((topic, index) => (
          <div key={topic.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${
                index % 4 === 0 ? 'from-orange-400 to-red-500' :
                index % 4 === 1 ? 'from-yellow-400 to-orange-500' :
                index % 4 === 2 ? 'from-blue-400 to-purple-500' :
                'from-green-400 to-blue-500'
              } rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}>
                {topic.iconUrl ? (
                  <img
                    src={topic.iconUrl}
                    alt={topic.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to text icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <span 
                  className="text-white font-bold text-xl"
                  style={{ display: topic.iconUrl ? 'none' : 'block' }}
                >
                  {topic.icon}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(topic)}
                  className={`p-2 rounded-lg transition-colors ${
                    topic.isActive 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={topic.isActive ? 'Active' : 'Inactive'}
                >
                  {topic.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => handleEdit(topic)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(topic)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.name}</h3>
              <p className="text-gray-600 mb-4">{topic.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  topic.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {topic.isActive ? 'Active' : 'Inactive'}
                </span>
                
                <span>
                  Created: {new Date(topic.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gameTopics.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Game Topics</h3>
          <p className="text-gray-600 mb-6">
            Belum ada game topic. Tambahkan topic pertama untuk memulai.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Add First Topic
          </button>
        </div>
      )}
    </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Game Topic"
        message={`Yakin ingin menghapus topic "${getDeleteTopicName()}"? Tindakan ini akan menghapus topic dan chat room terkait secara permanen.`}
        confirmText="Hapus Topic"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

export default AdminGameTopics;