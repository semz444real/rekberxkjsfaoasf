import React from 'react';
import { FileText, Clock, User, Shield, MessageSquare, AlertTriangle } from 'lucide-react';

const AdminLogs: React.FC = () => {
  // Mock log data - in real app this would come from props or API
  const logs = [
    {
      id: '1',
      type: 'user_action',
      action: 'User Login',
      user: 'john_doe',
      details: 'User logged in successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      severity: 'info'
    },
    {
      id: '2',
      type: 'admin_action',
      action: 'Role Changed',
      user: 'admin_user',
      details: 'Changed user role from user to admin',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      severity: 'warning'
    },
    {
      id: '3',
      type: 'rekber_action',
      action: 'Rekber Created',
      user: 'seller123',
      details: 'New Rekber group created for Mobile Legends transaction',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      severity: 'info'
    },
    {
      id: '4',
      type: 'system_action',
      action: 'Topic Added',
      user: 'system',
      details: 'New game topic "Valorant" added to system',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      severity: 'info'
    },
    {
      id: '5',
      type: 'security_action',
      action: 'Failed Login',
      user: 'unknown',
      details: 'Multiple failed login attempts detected',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      severity: 'error'
    }
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'user_action':
        return <User className="h-4 w-4" />;
      case 'admin_action':
        return <Shield className="h-4 w-4" />;
      case 'rekber_action':
        return <Shield className="h-4 w-4" />;
      case 'system_action':
        return <MessageSquare className="h-4 w-4" />;
      case 'security_action':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user_action':
        return 'text-blue-600 bg-blue-50';
      case 'admin_action':
        return 'text-red-600 bg-red-50';
      case 'rekber_action':
        return 'text-green-600 bg-green-50';
      case 'system_action':
        return 'text-purple-600 bg-purple-50';
      case 'security_action':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
            <p className="text-gray-600">Monitor aktivitas sistem dan pengguna</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {logs.filter(l => l.type === 'user_action').length}
              </p>
              <p className="text-gray-600 text-sm">User Actions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {logs.filter(l => l.type === 'admin_action').length}
              </p>
              <p className="text-gray-600 text-sm">Admin Actions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {logs.filter(l => l.type === 'rekber_action').length}
              </p>
              <p className="text-gray-600 text-sm">Rekber</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {logs.filter(l => l.type === 'system_action').length}
              </p>
              <p className="text-gray-600 text-sm">System</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {logs.filter(l => l.severity === 'error').length}
              </p>
              <p className="text-gray-600 text-sm">Errors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Last updated: just now</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(log.type)}`}>
                  {getLogIcon(log.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{log.action}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{log.details}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>User: <strong>{log.user}</strong></span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {logs.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Logs Available</h3>
            <p className="text-gray-600">System logs will appear here when activities occur</p>
          </div>
        )}
      </div>

      {/* Log Retention Info */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-900">Log Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Log Types</h4>
            <ul className="space-y-1 text-blue-800 text-sm">
              <li>• User Actions: Login, logout, profile changes</li>
              <li>• Admin Actions: Role changes, user management</li>
              <li>• Rekber Actions: Group creation, status updates</li>
              <li>• System Actions: Topic management, system changes</li>
              <li>• Security Actions: Failed logins, suspicious activity</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Retention Policy</h4>
            <ul className="space-y-1 text-blue-800 text-sm">
              <li>• Logs are stored locally in browser storage</li>
              <li>• Data persists until browser cache is cleared</li>
              <li>• No automatic log rotation in demo mode</li>
              <li>• Production would use proper log management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;