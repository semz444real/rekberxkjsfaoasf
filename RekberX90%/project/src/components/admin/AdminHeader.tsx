import React from 'react';
import { Shield, Users, MessageSquare, Settings, BarChart3, FileText, Crown } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: 'overview' | 'rekber' | 'users' | 'topics' | 'roles' | 'logs' | 'reports';
  setActiveTab: (tab: 'overview' | 'rekber' | 'users' | 'topics' | 'roles' | 'logs' | 'reports') => void;
  username: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, setActiveTab, username }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'rekber', label: 'Rekber', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'topics', label: 'Topics', icon: MessageSquare },
    { id: 'roles', label: 'Roles', icon: Crown },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'reports', label: 'Reports', icon: Settings }
  ] as const;

  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Welcome back, {username}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              <p className="text-red-800 font-semibold text-sm">🛡️ Admin Access</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-red-100 text-red-700 shadow-md'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;