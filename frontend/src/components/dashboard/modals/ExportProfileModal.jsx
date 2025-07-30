import React, { useState } from 'react';
import { X, Download, FileText, Database, Shield, Check, AlertCircle } from 'lucide-react';

const ExportProfileModal = ({ isOpen, onClose, profileData }) => {
  const [exportSettings, setExportSettings] = useState({
    format: 'json',
    includePersonalInfo: true,
    includeActivityLog: true,
    includeSecurityInfo: false,
    includeDocuments: false,
    dateRange: 'all'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate export data based on settings
      const exportData = {
        timestamp: new Date().toISOString(),
        user: {
          ...(exportSettings.includePersonalInfo && {
            name: profileData?.name || 'John Doe',
            email: profileData?.email || 'john.doe@company.com',
            role: profileData?.role || 'Administrator',
            department: profileData?.department || 'IT Operations',
            joinDate: '2023-01-15'
          }),
          ...(exportSettings.includeSecurityInfo && {
            lastLogin: '2024-01-20T10:30:00Z',
            twoFactorEnabled: true,
            sessionCount: 3
          })
        },
        ...(exportSettings.includeActivityLog && {
          activityLog: [
            { date: '2024-01-20', action: 'Profile updated', type: 'info' },
            { date: '2024-01-19', action: 'Password changed', type: 'security' },
            { date: '2024-01-18', action: 'SOP accessed', type: 'activity' }
          ]
        }),
        ...(exportSettings.includeDocuments && {
          documents: [
            { name: 'Emergency Response SOP', lastAccessed: '2024-01-20' },
            { name: 'System Maintenance Guide', lastAccessed: '2024-01-19' }
          ]
        })
      };

      // Create and download file
      const fileName = `profile_export_${new Date().toISOString().split('T')[0]}.${exportSettings.format}`;
      const content = exportSettings.format === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : convertToCSV(exportData);
      
      const blob = new Blob([content], { 
        type: exportSettings.format === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data) => {
    // Simple CSV conversion for demonstration
    const headers = Object.keys(data.user || {});
    const values = Object.values(data.user || {});
    return [headers.join(','), values.join(',')].join('\n');
  };

  const handleSettingChange = (field, value) => {
    setExportSettings(prev => ({ ...prev, [field]: value }));
  };

  const getEstimatedSize = () => {
    let size = 5; // Base size in KB
    if (exportSettings.includePersonalInfo) size += 2;
    if (exportSettings.includeActivityLog) size += 10;
    if (exportSettings.includeSecurityInfo) size += 3;
    if (exportSettings.includeDocuments) size += 15;
    return size;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export Profile Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {exportComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Export Complete!</h3>
            <p className="text-gray-500">Your profile data has been downloaded successfully.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
              <div className="flex space-x-4">
                {[
                  { value: 'json', label: 'JSON', icon: FileText, desc: 'Structured data format' },
                  { value: 'csv', label: 'CSV', icon: Database, desc: 'Spreadsheet compatible' }
                ].map(({ value, label, icon: Icon, desc }) => (
                  <label key={value} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={value}
                      checked={exportSettings.format === value}
                      onChange={(e) => handleSettingChange('format', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 text-center transition-colors ${
                      exportSettings.format === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${
                        exportSettings.format === value ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-gray-500 mt-1">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Include Data</label>
              <div className="space-y-3">
                {[
                  { key: 'includePersonalInfo', label: 'Personal Information', desc: 'Name, email, role, department' },
                  { key: 'includeActivityLog', label: 'Activity Log', desc: 'Recent actions and system usage' },
                  { key: 'includeSecurityInfo', label: 'Security Information', desc: 'Login history and security settings' },
                  { key: 'includeDocuments', label: 'Document Access History', desc: 'SOPs accessed and timestamps' }
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSettings[key]}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={exportSettings.dateRange}
                onChange={(e) => handleSettingChange('dateRange', e.target.value)}
              >
                <option value="all">All time</option>
                <option value="year">Last 12 months</option>
                <option value="month">Last 30 days</option>
                <option value="week">Last 7 days</option>
              </select>
            </div>

            {/* Export Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 text-sm">Export Information</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Estimated file size: ~{getEstimatedSize()}KB
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Your data will be exported in a secure format. This action is logged for security purposes.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isExporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isExporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportProfileModal;
