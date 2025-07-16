import React, { useState, useEffect } from 'react';
import { Crown, Users, MessageCircle, Clock, TrendingUp, Calendar, Award, Activity } from 'lucide-react';

interface AdminRoleManagementProps {
  users: any[];
  onSetCustomRole: (username: string, role: string, color: string) => void;
  onRemoveCustomRole: (username: string) => void;
}

const AdminRoleManagement: React.FC<AdminRoleManagementProps> = ({
  users,
  onSetCustomRole,
  onRemoveCustomRole
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [activityData, setActivityData] = useState<any[]>([]);

  const customRoleUsers = users.filter(user => user.customRole);

  useEffect(() => {
    // Generate mock activity data for custom role users
    const generateActivityData = () => {
      return customRoleUsers.map(user => {
        // Mock data - in real app this would come from actual activity logs
        const baseActivity = Math.floor(Math.random() * 100) + 20;
        const messagesCount = Math.floor(Math.random() * 500) + 50;
        const rekberCount = Math.floor(Math.random() * 10) + 1;
        const lastActive = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        
        return {
          ...user,
          activity: {
            messages: messagesCount,
            rekberParticipated: rekberCount,
            lastActive,
            activityScore: baseActivity,
            weeklyMessages: Math.floor(messagesCount / 4),
            monthlyMessages: messagesCount,
            averageResponseTime: Math.floor(Math.random() * 300) + 30, // seconds
            helpfulRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
            reportCount: Math.floor(Math.random() * 3), // 0-2 reports
            warningCount: Math.floor(Math.random() * 2), // 0-1 warnings
          }
        };
      });
    };

    setActivityData(generateActivityData());
  }, [customRoleUsers.length, selectedPeriod]);

  const getActivityLevel = (score: number) => {
    if (score >= 80) return { level: 'Very Active', color: 'text-green-600 bg-green-100', icon: '🔥' };
    if (score >= 60) return { level: 'Active', color: 'text-blue-600 bg-blue-100', icon: '⚡' };
    if (score >= 40) return { level: 'Moderate', color: 'text-yellow-600 bg-yellow-100', icon: '📊' };
    return { level: 'Low', color: 'text-gray-600 bg-gray-100', icon: '😴' };
  };

  const getLastActiveText = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const totalCustomRoles = customRoleUsers.length;
  const activeToday = activityData.filter(u => {
    const lastActive = new Date(u.activity.lastActive);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length;

  const averageMessages = activityData.length > 0 
    ? Math.floor(activityData.reduce((sum, u) => sum + u.activity.weeklyMessages, 0) / activityData.length)
    : 0;

  const topPerformer = activityData.length > 0 
    ? activityData.reduce((top, user) => user.activity.activityScore > top.activity.activityScore ? user : top)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Custom Role Activity Dashboard</h2>
            <p className="text-gray-600">Monitor aktivitas dan performa user dengan custom role</p>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Activity Period</h3>
          <div className="flex space-x-2">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCustomRoles}</p>
              <p className="text-gray-600">Custom Role Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeToday}</p>
              <p className="text-gray-600">Active Today</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{averageMessages}</p>
              <p className="text-gray-600">Avg Messages/Week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{topPerformer?.username || 'N/A'}</p>
              <p className="text-gray-600">Top Performer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">User Activity Details</h3>
        </div>
        
        {activityData.length === 0 ? (
          <div className="p-12 text-center">
            <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Custom Role Users</h3>
            <p className="text-gray-600">Belum ada user dengan custom role untuk dimonitor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Activity Level</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rekber</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activityData.map((user) => {
                  const activityLevel = getActivityLevel(user.activity.activityScore);
                  return (
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
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                ID: {user.userId}
                              </span>
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: user.customRoleColor }}
                              >
                                ⭐ {user.customRole}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{activityLevel.icon}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${activityLevel.color}`}>
                            {activityLevel.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{user.activity.weeklyMessages}</p>
                          <p className="text-gray-500">this week</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{user.activity.rekberParticipated}</p>
                          <p className="text-gray-500">transactions</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{getLastActiveText(user.activity.lastActive)}</p>
                          <p className="text-gray-500">{user.activity.lastActive.toLocaleDateString('id-ID')}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-gray-900">{user.activity.helpfulRating}/5.0</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{user.activity.averageResponseTime}s avg</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={user.activity.reportCount > 0 ? 'text-red-500' : 'text-green-500'}>
                              {user.activity.reportCount > 0 ? '⚠️' : '✅'}
                            </span>
                            <span className="text-gray-900">{user.activity.reportCount} reports</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={user.activity.warningCount > 0 ? 'text-orange-500' : 'text-green-500'}>
                              {user.activity.warningCount > 0 ? '🔶' : '✅'}
                            </span>
                            <span className="text-gray-900">{user.activity.warningCount} warnings</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-bold text-green-900">Top Performers</h3>
          </div>
          
          <div className="space-y-3">
            {activityData
              .sort((a, b) => b.activity.activityScore - a.activity.activityScore)
              .slice(0, 3)
              .map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: user.customRoleColor }}
                      >
                        {user.customRole}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{user.activity.activityScore}%</p>
                    <p className="text-xs text-gray-500">activity score</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-900">Activity Summary</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Most Active User</span>
              <span className="font-semibold text-blue-600">
                {topPerformer?.username || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Total Messages (Week)</span>
              <span className="font-semibold text-blue-600">
                {activityData.reduce((sum, u) => sum + u.activity.weeklyMessages, 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Avg Response Time</span>
              <span className="font-semibold text-blue-600">
                {activityData.length > 0 
                  ? Math.floor(activityData.reduce((sum, u) => sum + u.activity.averageResponseTime, 0) / activityData.length)
                  : 0}s
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Users with Issues</span>
              <span className="font-semibold text-red-600">
                {activityData.filter(u => u.activity.reportCount > 0 || u.activity.warningCount > 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleManagement;