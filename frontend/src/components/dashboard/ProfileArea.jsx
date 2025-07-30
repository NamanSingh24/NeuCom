import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Badge,
  Key,
  Download,
  Upload,
  Camera,
  Edit,
  Save,
  X,
  Check,
  Shield,
  Clock,
  Activity,
  Settings,
  Bell,
  Lock,
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';

// Import modal components
import ChangePasswordModal from './modals/ChangePasswordModal';
import SecuritySettingsModal from './modals/SecuritySettingsModal';
import ExportProfileModal from './modals/ExportProfileModal';
import DeleteAccountModal from './modals/DeleteAccountModal';

const ProfileArea = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSecuritySettingsModal, setShowSecuritySettingsModal] = useState(false);
  const [showExportProfileModal, setShowExportProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'System Administrator with 5+ years of experience in managing enterprise SOP systems.',
    
    // Professional Information
    role: 'Administrator',
    department: 'Operations',
    employeeId: 'EMP-001',
    joinDate: '2020-01-15',
    manager: 'Jane Smith',
    
    // Account Settings
    timezone: 'America/New_York',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    
    // Security
    lastLogin: '2025-07-24T10:30:00Z',
    twoFactorEnabled: true,
    sessionTimeout: 30,
    
    // Preferences
    documentProcessedNotifications: true,
    systemMaintenanceAlerts: false,
    autoSaveEnabled: true,
    voiceAssistantEnabled: true
  });

  const [editData, setEditData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileData({ ...editData });
      setIsEditing(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
        return;
      }
      
      setProfilePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setSaveStatus('photo');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
    fileInputRef.current.value = '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and account preferences</p>
        </div>
        
        {/* Save Status */}
        {saveStatus && (
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            saveStatus === 'success' ? 'bg-green-100 text-green-800' :
            saveStatus === 'photo' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {saveStatus === 'success' ? <Check className="h-4 w-4" /> : 
             saveStatus === 'photo' ? <Camera className="h-4 w-4" /> :
             <X className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {saveStatus === 'success' ? 'Profile updated successfully' : 
               saveStatus === 'photo' ? 'Photo uploaded successfully' :
               'Failed to upload photo or invalid file'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card-corporate p-6 text-center">
            <div className="relative inline-block mb-4">
              <div 
                className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                onClick={handlePhotoClick}
              >
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  `${profileData.firstName[0]}${profileData.lastName[0]}`
                )}
              </div>
              <button 
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            {photoPreview && (
              <div className="mb-4">
                <button
                  onClick={removePhoto}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Remove Photo
                </button>
              </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-900">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-600 mb-2">{profileData.role}</p>
            <p className="text-sm text-gray-500 mb-4">{profileData.department}</p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profileData.joinDate)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="w-full btn-corporate flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="h-4 w-4" />}
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => setShowExportProfileModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card-corporate p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.lastName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.phone}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.location}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="card-corporate p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Professional Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <p className="text-gray-900 py-2">{profileData.role}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <p className="text-gray-900 py-2">{profileData.department}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <p className="text-gray-900 py-2">{profileData.employeeId}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                <p className="text-gray-900 py-2">{profileData.manager}</p>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="card-corporate p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Security</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">
                    {profileData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profileData.twoFactorEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profileData.twoFactorEnabled ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Last Login</p>
                  <p className="text-sm text-gray-500">{formatLastLogin(profileData.lastLogin)}</p>
                </div>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowChangePasswordModal(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Key className="h-4 w-4" />
                  <span>Change Password</span>
                </button>
                <button 
                  onClick={() => setShowSecuritySettingsModal(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Security Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Activity & Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="card-corporate p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Logged in from New York</span>
                  <span className="text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Updated profile information</span>
                  <span className="text-gray-400">1d ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">Changed password</span>
                  <span className="text-gray-400">3d ago</span>
                </div>
              </div>
            </div>

            {/* Quick Preferences */}
            <div className="card-corporate p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Quick Preferences</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Document Processing Alerts</span>
                    <p className="text-xs text-gray-500">Get notified when documents are processed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={profileData.documentProcessedNotifications}
                      onChange={(e) => handleInputChange('documentProcessedNotifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">System Maintenance Alerts</span>
                    <p className="text-xs text-gray-500">Receive notifications about system updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={profileData.systemMaintenanceAlerts}
                      onChange={(e) => handleInputChange('systemMaintenanceAlerts', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Auto-Save</span>
                    <p className="text-xs text-gray-500">Automatically save your work</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={profileData.autoSaveEnabled}
                      onChange={(e) => handleInputChange('autoSaveEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Voice Assistant</span>
                    <p className="text-xs text-gray-500">Enable voice input and responses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={profileData.voiceAssistantEnabled}
                      onChange={(e) => handleInputChange('voiceAssistantEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card-corporate p-6 border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Danger Zone</span>
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                <p className="text-sm text-red-700 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button 
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onPasswordChanged={(message) => {
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(null), 3000);
        }}
      />

      <SecuritySettingsModal
        isOpen={showSecuritySettingsModal}
        onClose={() => setShowSecuritySettingsModal(false)}
        profileData={profileData}
        onSave={(settings) => {
          setProfileData(prev => ({ ...prev, ...settings }));
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(null), 3000);
        }}
      />

      <ExportProfileModal
        isOpen={showExportProfileModal}
        onClose={() => setShowExportProfileModal(false)}
        profileData={profileData}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        profileData={profileData}
      />
    </div>
  );
};

export default ProfileArea;
