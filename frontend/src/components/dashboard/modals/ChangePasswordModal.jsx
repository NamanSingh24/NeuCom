import React, { useState } from 'react';
import { X, Eye, EyeOff, Key, Check, AlertTriangle } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose, onSave }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = () => {
    const newErrors = {};
    
    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      onSave();
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to change password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                value={passwords.newPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.submit && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Key className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
