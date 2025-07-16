import React from 'react';
import { Users, Shield, MessageSquare, TrendingUp, Clock, CheckCircle, AlertTriangle, Crown } from 'lucide-react';

interface AdminOverviewProps {
  users: any[];
  rekberGroups: any[];
  gameTopics: any[];
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ users, rekberGroups, gameTopics }) => {
  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Rekber',
      value: rekberGroups.filter(g => g.status === 'active').length,
      icon: Shield,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Game Topics',
      value: gameTopics.filter(t => t.isActive).length,
      icon: MessageSquare,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Completed Rekber',
      value: rekberGroups.filter(g => g.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    }
  ];

  const recentActivity = [
    { type: 'user_join', message: 'New user registered', time: '2 minutes ago', icon: Users },
    { type: 'rekber_created', message: 'New Rekber group created', time: '5 minutes ago', icon: Shield },
    { type: 'topic_added', message: 'New game topic added', time: '10 minutes ago', icon: MessageSquare },
    { type: 'rekber_completed', message: 'Rekber transaction completed', time: '15 minutes ago', icon: CheckCircle }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="h-6 w-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-gray-500 text-sm">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="h-6 w-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors group">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Create Admin</p>
                  <p className="text-blue-600 text-sm">Add new admin user</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl text-left transition-colors group">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Add Game Topic</p>
                  <p className="text-green-600 text-sm">Create new game category</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors group">
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">Manage Roles</p>
                  <p className="text-purple-600 text-sm">Set custom user roles</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold text-green-900">System Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-green-800 font-medium">Database</p>
            <p className="text-green-600 text-sm">Operational</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-green-800 font-medium">Chat System</p>
            <p className="text-green-600 text-sm">Operational</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-green-800 font-medium">Rekber Service</p>
            <p className="text-green-600 text-sm">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;