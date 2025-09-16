import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Lock,
  HardDrive,
  Cpu,
  BarChart3,
  FileText,
  Zap
} from 'lucide-react';


const SettingsArea = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  // Data stats state for dynamic file sizes/counts
  const [dataStats, setDataStats] = useState({
    documentCount: 0,
    documentSizeGB: 0,
    vectorCount: 0,
    vectorDbSizeGB: 0
  });
  
  // Load data stats from backend on mount
  useEffect(() => {
    const fetchDataStats = async () => {
      try {
        if (apiService.getDataStats) {
          const stats = await apiService.getDataStats();
          setDataStats({
            documentCount: stats.documentCount || 0,
            documentSizeGB: stats.documentSizeGB || 0,
            vectorCount: stats.vectorCount || 0,
            vectorDbSizeGB: stats.vectorDbSizeGB || 0
          });
        }
      } catch (err) {
        // fallback: keep zeros
      }
    };
    fetchDataStats();
  }, []);

  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    timezone: 'UTC',
    theme: 'light', // Always default to light, will be updated by theme context
    autoSave: true,
    notifications: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    ipWhitelist: '',
    
    // AI Settings
    aiModel: 'llama3-8b-8192',
    responseLength: 'medium',
    confidence: 0.8,
    voiceEnabled: true,
    autoProcessing: true,
    temperature: 0.3,
    maxTokens: 1000,
    
    // System Settings
    maxFileSize: 50,
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: 'all-MiniLM-L6-v2',
    maxSearchResults: 5,
    vectorDimensions: 1536,
    backupFrequency: 'daily',
    logLevel: 'info',
    
    // Voice Settings
    ttsVoice: 'en',
    sttModel: 'base',
    voiceSpeed: 1.0,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    documentProcessed: true,
    systemAlerts: true,
    weeklyReports: false
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Load settings from backend on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync settings theme with context theme
  useEffect(() => {
    if (theme) {
      setSettings(prev => ({ ...prev, theme }));
    }
  }, [theme]);

  const loadSettings = async () => {
    try {
      const response = await apiService.getSettings();
      if (response.success) {
        // Map backend settings to frontend format
        const backendSettings = response.settings;
        setSettings({
          // General Settings
          language: backendSettings.language || 'en',
          timezone: backendSettings.timezone || 'UTC',
          theme: backendSettings.theme || 'light',
          autoSave: backendSettings.auto_save !== undefined ? backendSettings.auto_save : true,
          notifications: backendSettings.notifications !== undefined ? backendSettings.notifications : true,
          
          // Security Settings
          twoFactorAuth: backendSettings.two_factor_auth || false,
          sessionTimeout: backendSettings.session_timeout || 30,
          passwordExpiry: backendSettings.password_expiry || 90,
          ipWhitelist: backendSettings.ip_whitelist || '',
          
          // AI Settings
          aiModel: backendSettings.ai_model || 'llama3-8b-8192',
          responseLength: backendSettings.response_length || 'medium',
          confidence: backendSettings.confidence || 0.8,
          voiceEnabled: backendSettings.voice_enabled !== undefined ? backendSettings.voice_enabled : true,
          autoProcessing: backendSettings.auto_processing !== undefined ? backendSettings.auto_processing : true,
          temperature: backendSettings.temperature || 0.3,
          maxTokens: backendSettings.max_tokens || 1000,
          
          // System Settings
          maxFileSize: backendSettings.max_file_size || 50,
          chunkSize: backendSettings.chunk_size || 1000,
          chunkOverlap: backendSettings.chunk_overlap || 200,
          embeddingModel: backendSettings.embedding_model || 'all-MiniLM-L6-v2',
          maxSearchResults: backendSettings.max_search_results || 5,
          vectorDimensions: 1536, // Not configurable in backend
          backupFrequency: backendSettings.backup_frequency || 'daily',
          logLevel: backendSettings.log_level || 'info',
          
          // Voice Settings
          ttsVoice: backendSettings.tts_voice || 'en',
          sttModel: backendSettings.stt_model || 'base',
          voiceSpeed: backendSettings.voice_speed || 1.0,
          
          // Notification Settings
          emailNotifications: backendSettings.email_notifications !== undefined ? backendSettings.email_notifications : true,
          pushNotifications: backendSettings.push_notifications || false,
          documentProcessed: backendSettings.document_processed !== undefined ? backendSettings.document_processed : true,
          systemAlerts: backendSettings.system_alerts !== undefined ? backendSettings.system_alerts : true,
          weeklyReports: backendSettings.weekly_reports || false
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ai', label: 'AI & Processing', icon: Zap },
    { id: 'system', label: 'System', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Storage', icon: HardDrive },
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Handle theme changes immediately
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Map frontend settings to backend format
      const backendSettings = {
        // General Settings
        language: settings.language,
        timezone: settings.timezone,
        theme: settings.theme,
        auto_save: settings.autoSave,
        notifications: settings.notifications,
        
        // Security Settings
        two_factor_auth: settings.twoFactorAuth,
        session_timeout: settings.sessionTimeout,
        password_expiry: settings.passwordExpiry,
        ip_whitelist: settings.ipWhitelist,
        
        // AI Settings
        ai_model: settings.aiModel,
        response_length: settings.responseLength,
        confidence: settings.confidence,
        voice_enabled: settings.voiceEnabled,
        auto_processing: settings.autoProcessing,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        
        // System Settings
        max_file_size: settings.maxFileSize,
        chunk_size: settings.chunkSize,
        chunk_overlap: settings.chunkOverlap,
        embedding_model: settings.embeddingModel,
        max_search_results: settings.maxSearchResults,
        backup_frequency: settings.backupFrequency,
        log_level: settings.logLevel,
        
        // Voice Settings
        tts_voice: settings.ttsVoice,
        stt_model: settings.sttModel,
        voice_speed: settings.voiceSpeed,
        
        // Notification Settings
        email_notifications: settings.emailNotifications,
        push_notifications: settings.pushNotifications,
        document_processed: settings.documentProcessed,
        system_alerts: settings.systemAlerts,
        weekly_reports: settings.weeklyReports
      };

      const response = await apiService.updateSettings(backendSettings);
      if (response.success) {
        setSaveStatus('success');
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        const response = await apiService.resetSettings();
        if (response.success) {
          // Reload settings from backend after reset
          await loadSettings();
          setSaveStatus('success');
        } else {
          throw new Error(response.message || 'Failed to reset settings');
        }
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (error) {
        console.error('Error resetting settings:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // System action handlers
  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear the system cache? This may temporarily slow down performance.')) {
      try {
        // Simulate cache clearing
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Cache cleared successfully!');
      } catch (error) {
        alert('Failed to clear cache. Please try again.');
      }
    }
  };

  const handleExportLogs = () => {
    // Generate sample log data
    const logData = [
      { timestamp: new Date().toISOString(), level: 'INFO', message: 'System started successfully' },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'WARN', message: 'High memory usage detected' },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'ERROR', message: 'Failed to process document' }
    ];

    const csvContent = "Timestamp,Level,Message\n" + 
      logData.map(log => `"${log.timestamp}","${log.level}","${log.message}"`).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSystemReport = () => {
    // Generate system report
    const reportData = {
      systemInfo: {
        uptime: '15 days, 8 hours',
        memory: { used: '2.4 GB', total: '8.0 GB' },
        storage: { used: '45.2 GB', total: '100 GB' },
        activeUsers: 24,
        totalDocuments: 156
      },
      performance: {
        avgResponseTime: '1.2s',
        successRate: '94.8%',
        errorRate: '0.2%'
      }
    };

    const reportContent = `System Report - ${new Date().toLocaleString()}

SYSTEM INFORMATION
==================
Uptime: ${reportData.systemInfo.uptime}
Memory Usage: ${reportData.systemInfo.memory.used} / ${reportData.systemInfo.memory.total}
Storage Usage: ${reportData.systemInfo.storage.used} / ${reportData.systemInfo.storage.total}
Active Users: ${reportData.systemInfo.activeUsers}
Total Documents: ${reportData.systemInfo.totalDocuments}

PERFORMANCE METRICS
==================
Average Response Time: ${reportData.performance.avgResponseTime}
Success Rate: ${reportData.performance.successRate}
Error Rate: ${reportData.performance.errorRate}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Data management handlers
  const handleExportAllDocuments = () => {
    // Simulate document export
    alert('Exporting all documents... This may take a few minutes for large collections.');
    // In a real implementation, this would initiate a background job
  };

  const handleDeleteAllDocuments = () => {
    if (confirm('Are you sure you want to delete ALL documents? This action cannot be undone!')) {
      if (confirm('This will permanently delete 145 documents (3.2 GB). Type "DELETE" to confirm.')) {
        alert('Document deletion initiated. This process will run in the background.');
      }
    }
  };

  const handleBackupDatabase = async () => {
    try {
      alert('Database backup started. You will be notified when complete.');
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      alert('Failed to start database backup. Please try again.');
    }
  };

  const handleRebuildIndex = () => {
    if (confirm('Rebuilding the vector index will temporarily affect search performance. Continue?')) {
      alert('Index rebuild started. This process may take 10-15 minutes.');
    }
  };

  const handleDownloadMyData = () => {
    // Simulate comprehensive data export
    const userData = {
      profile: { name: 'John Doe', email: 'john.doe@company.com' },
      documents: ['Document1.pdf', 'Document2.pdf'],
      conversations: ['Chat history 1', 'Chat history 2'],
      preferences: settings
    };

    const dataContent = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_data_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllMyData = () => {
    if (confirm('This will delete ALL your data including profile, documents, and conversation history. This action CANNOT be undone!')) {
      if (confirm('Are you absolutely sure? Type "DELETE ALL MY DATA" to confirm this irreversible action.')) {
        alert('Data deletion process initiated. You will be logged out shortly.');
        // In a real app, this would call the API to delete all user data
      }
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">General Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">Greenwich Mean Time</option>
              <option value="CET">Central European Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex space-x-3">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Monitor, label: 'Auto' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    theme === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSettingChange('theme', value)}
                  style={theme === value ? { color: '#ffffff !important' } : {}}
                >
                  <Icon className={`h-4 w-4 ${theme === value ? 'text-white' : ''}`} />
                  <span className={`text-sm ${theme === value ? 'text-white' : ''}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Application Behavior</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Auto-save changes</label>
              <p className="text-sm text-gray-600">Automatically save your work as you type</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Enable notifications</label>
              <p className="text-sm text-gray-600">Receive notifications about system events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Two-Factor Authentication</label>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              min="5"
              max="480"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.passwordExpiry}
              onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
              min="30"
              max="365"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">API Access</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type={showApiKey ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value="sk-1234567890abcdef..."
                readOnly
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            <button 
              onClick={() => {
                const newApiKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                handleSettingChange('groqApiKey', newApiKey);
              }}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">AI Model Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.aiModel}
              onChange={(e) => handleSettingChange('aiModel', e.target.value)}
            >
              <option value="llama3-8b-8192">Llama 3 8B (Default)</option>
              <option value="groq-mixtral" disabled>Groq Mixtral-8x7B (Coming Soon)</option>
              <option value="groq-llama" disabled>Groq LLaMA 2-70B (Coming Soon)</option>
              <option value="openai-gpt4" disabled>OpenAI GPT-4 (Coming Soon)</option>
              <option value="openai-gpt3.5" disabled>OpenAI GPT-3.5 Turbo (Coming Soon)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Length</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.responseLength}
              onChange={(e) => handleSettingChange('responseLength', e.target.value)}
            >
              <option value="short">Short (50-100 words)</option>
              <option value="medium">Medium (100-300 words)</option>
              <option value="long">Long (300-500 words)</option>
              <option value="detailed">Detailed (500+ words)</option>
            </select>
          </div>
        </div>
        
        {/* <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Threshold: {(settings.confidence * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            value={settings.confidence}
            onChange={(e) => handleSettingChange('confidence', parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div> */}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Processing Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Voice Processing</label>
              <p className="text-sm text-gray-600">Enable voice input and output features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.voiceEnabled}
                onChange={(e) => handleSettingChange('voiceEnabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Auto-process Documents</label>
              <p className="text-sm text-gray-600">Automatically process uploaded documents</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoProcessing}
                onChange={(e) => handleSettingChange('autoProcessing', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">File Processing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chunk Size (tokens)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.chunkSize}
              onChange={(e) => handleSettingChange('chunkSize', parseInt(e.target.value))}
              min="100"
              max="4000"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vector Dimensions</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.vectorDimensions}
              onChange={(e) => handleSettingChange('vectorDimensions', parseInt(e.target.value))}
            >
              <option value="768">768</option>
              <option value="1024">1024</option>
              <option value="1536">1536</option>
              <option value="2048">2048</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">System Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={settings.logLevel}
              onChange={(e) => handleSettingChange('logLevel', e.target.value)}
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={handleClearCache}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Clear Cache</span>
          </button>
          <button 
            onClick={handleExportLogs}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </button>
          <button 
            onClick={handleSystemReport}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>System Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <label className="text-sm font-medium text-gray-800">Email Notifications</label>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-600" />
              <div>
                <label className="text-sm font-medium text-gray-800">Push Notifications</label>
                <p className="text-sm text-gray-600">Receive push notifications on your device</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Document Processed</label>
              <p className="text-sm text-gray-600">When a document is successfully processed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.documentProcessed}
                onChange={(e) => handleSettingChange('documentProcessed', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">System Alerts</label>
              <p className="text-sm text-gray-600">Important system notifications and alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.systemAlerts}
                onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Weekly Reports</label>
              <p className="text-sm text-gray-600">Weekly usage and performance reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.weeklyReports}
                onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <h4 className="font-medium text-gray-800">Documents</h4>
                <p className="text-sm text-gray-600">
                  {dataStats.documentSizeGB ? `${dataStats.documentSizeGB} GB` : '--'}
                  {' • '}
                  {dataStats.documentCount ? `${dataStats.documentCount} files` : '--'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <button 
                onClick={handleExportAllDocuments}
                className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Export All Documents
              </button>
              <button 
                onClick={handleDeleteAllDocuments}
                className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete All Documents
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Database className="h-8 w-8 text-emerald-600" />
              <div>
                <h4 className="font-medium text-gray-800">Vector Database</h4>
                <p className="text-sm text-gray-600">
                  {dataStats.vectorDbSizeGB ? `${dataStats.vectorDbSizeGB} GB` : '--'}
                  {' • '}
                  {dataStats.vectorCount ? `${dataStats.vectorCount.toLocaleString()} vectors` : '--'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <button 
                onClick={handleBackupDatabase}
                className="w-full text-left px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Backup Database
              </button>
              <button 
                onClick={handleRebuildIndex}
                className="w-full text-left px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
              >
                Rebuild Index
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Privacy & Compliance</h3>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Data Retention Policy</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Documents and conversation data are retained for 365 days. 
                  After this period, data is automatically purged unless explicitly saved.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleDownloadMyData}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download My Data</span>
            </button>
            <button 
              onClick={handleDeleteAllMyData}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete All My Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'ai':
        return renderAISettings();
      case 'system':
        return renderSystemSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account, preferences, and system configuration</p>
          </div>
          
          {/* Save Status */}
          {saveStatus && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              saveStatus === 'success' ? 'bg-emerald-100 text-emerald-700' :
              saveStatus === 'error' ? 'bg-red-100 text-red-700' :
              'bg-indigo-100 text-indigo-700'
            }`}>
              {saveStatus === 'success' ? <Check className="h-4 w-4" /> :
               saveStatus === 'error' ? <X className="h-4 w-4" /> :
               <Info className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {saveStatus === 'success' ? 'Settings saved successfully' :
                 saveStatus === 'error' ? 'Failed to save settings' :
                 'Settings reset to defaults'}
              </span>
            </div>
          )}
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {settingsTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {settingsTabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-600">
              {activeTab === 'general' && 'Configure basic application preferences and behavior'}
              {activeTab === 'security' && 'Set up security options and access controls'}
              {activeTab === 'ai' && 'Configure AI models and processing settings'}
              {activeTab === 'system' && 'Adjust system-level configurations and maintenance'}
              {activeTab === 'notifications' && 'Control how and when you receive notifications'}
              {activeTab === 'data' && 'Manage your data, storage, and privacy settings'}
            </p>
          </div>
          
          {renderTabContent()}
        </div>
        
        {/* Sticky Action Bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              onClick={handleResetSettings}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
            
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                className={`btn-corporate flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSaveSettings}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsArea;
