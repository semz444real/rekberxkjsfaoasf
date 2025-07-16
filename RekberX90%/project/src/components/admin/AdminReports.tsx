import React, { useState } from 'react';
import { AlertTriangle, User, Clock, CheckCircle, XCircle, Eye, Ban, Volume2, VolumeX } from 'lucide-react';

interface UserReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUsername: string;
  reason: 'scam' | 'spam' | 'harassment' | 'inappropriate' | 'other';
  description: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
  evidence?: string; // screenshot/proof
  adminAction?: {
    actionType: 'mute' | 'ban' | 'warning' | 'none';
    duration?: number; // in seconds for mute
    adminId: string;
    adminUsername: string;
    actionTimestamp: string;
    notes?: string;
  };
}

interface AdminReportsProps {
  currentUser: any;
  onTakeAction: (reportId: string, action: any) => void;
}

const AdminReports: React.FC<AdminReportsProps> = ({ currentUser, onTakeAction }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionForm, setActionForm] = useState({
    actionType: 'none' as 'mute' | 'ban' | 'warning' | 'none',
    duration: 300, // 5 minutes default
    notes: ''
  });

  // Mock data - in real app this would come from props
  const mockReports: UserReport[] = [
    {
      id: '1',
      reporterId: '123456',
      reporterUsername: 'user123',
      reportedUserId: '789012',
      reportedUsername: 'scammer_user',
      reason: 'scam',
      description: 'User ini menipu saya, sudah transfer tapi tidak memberikan item game',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'pending',
      evidence: 'screenshot_bukti.jpg'
    },
    {
      id: '2',
      reporterId: '456789',
      reporterUsername: 'buyer_honest',
      reportedUserId: '345678',
      reportedUsername: 'spammer123',
      reason: 'spam',
      description: 'User ini spam pesan terus menerus di chat room',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: '3',
      reporterId: '111222',
      reporterUsername: 'victim_user',
      reportedUserId: '333444',
      reportedUsername: 'toxic_player',
      reason: 'harassment',
      description: 'User ini menggunakan kata-kata kasar dan mengancam',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'resolved',
      adminAction: {
        actionType: 'mute',
        duration: 3600,
        adminId: currentUser?.userId || '200001',
        adminUsername: currentUser?.username || 'admin',
        actionTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        notes: 'Muted for 1 hour due to harassment'
      }
    }
  ];

  const filteredReports = mockReports.filter(report => {
    if (activeFilter === 'all') return true;
    return report.status === activeFilter;
  });

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'scam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'spam':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'harassment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'inappropriate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'scam': return 'Penipuan';
      case 'spam': return 'Spam';
      case 'harassment': return 'Pelecehan';
      case 'inappropriate': return 'Konten Tidak Pantas';
      default: return 'Lainnya';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleTakeAction = () => {
    if (!selectedReport) return;
    
    const action = {
      ...actionForm,
      adminId: currentUser?.userId,
      adminUsername: currentUser?.username,
      actionTimestamp: new Date().toISOString()
    };
    
    onTakeAction(selectedReport.id, action);
    setShowActionModal(false);
    setSelectedReport(null);
    setActionForm({ actionType: 'none', duration: 300, notes: '' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} detik`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam`;
    return `${Math.floor(seconds / 86400)} hari`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Reports</h2>
            <p className="text-gray-600">Kelola laporan dari pengguna tentang pelanggaran</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.status === 'resolved').length}
              </p>
              <p className="text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.reason === 'scam').length}
              </p>
              <p className="text-gray-600">Scam Reports</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Volume2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.filter(r => r.reason === 'spam').length}
              </p>
              <p className="text-gray-600">Spam Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex space-x-1">
            {[
              { key: 'pending', label: 'Pending', count: mockReports.filter(r => r.status === 'pending').length },
              { key: 'resolved', label: 'Resolved', count: mockReports.filter(r => r.status === 'resolved').length },
              { key: 'all', label: 'All Reports', count: mockReports.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeFilter === tab.key
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="divide-y divide-gray-100">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports</h3>
              <p className="text-gray-600">
                {activeFilter === 'pending' ? 'Tidak ada laporan yang menunggu' : 'Tidak ada laporan'}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getReasonColor(report.reason)}`}>
                        {getReasonText(report.reason)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(report.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-900 font-medium mb-1">
                        <span className="text-red-600">Reported:</span> {report.reportedUsername} (ID: {report.reportedUserId})
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="text-blue-600">Reporter:</span> {report.reporterUsername} (ID: {report.reporterId})
                      </p>
                    </div>
                    
                    <p className="text-gray-800 mb-3">{report.description}</p>
                    
                    {report.evidence && (
                      <p className="text-sm text-blue-600 mb-3">📎 Evidence: {report.evidence}</p>
                    )}
                    
                    {report.adminAction && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 text-sm">
                          <strong>Action Taken:</strong> {report.adminAction.actionType.toUpperCase()}
                          {report.adminAction.duration && ` for ${formatDuration(report.adminAction.duration)}`}
                        </p>
                        <p className="text-green-700 text-sm">
                          By: {report.adminAction.adminUsername} • {new Date(report.adminAction.actionTimestamp).toLocaleString('id-ID')}
                        </p>
                        {report.adminAction.notes && (
                          <p className="text-green-600 text-sm mt-1">Notes: {report.adminAction.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {report.status === 'pending' && (
                    <div className="ml-4">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowActionModal(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Take Action
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Take Action</h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">Against: <strong>{selectedReport.reportedUsername}</strong></p>
              <p className="text-gray-600 mb-2">Reason: <strong>{getReasonText(selectedReport.reason)}</strong></p>
              <p className="text-gray-600">Report: {selectedReport.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
                <select
                  value={actionForm.actionType}
                  onChange={(e) => setActionForm({ ...actionForm, actionType: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="none">No Action</option>
                  <option value="warning">Warning</option>
                  <option value="mute">Mute</option>
                  <option value="ban">Ban (Permanent)</option>
                </select>
              </div>

              {actionForm.actionType === 'mute' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mute Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={actionForm.duration}
                    onChange={(e) => setActionForm({ ...actionForm, duration: parseInt(e.target.value) || 300 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Duration: {formatDuration(actionForm.duration)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={actionForm.notes}
                  onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                  placeholder="Additional notes about this action..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTakeAction}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Apply Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;