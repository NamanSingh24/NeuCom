import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Shield, Type } from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose, profileData }) => {
  const [step, setStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});

  const requiredText = 'DELETE MY ACCOUNT';

  const validateStep = () => {
    const newErrors = {};

    if (step === 1 && !reason) {
      newErrors.reason = 'Please select a reason for deletion';
    }

    if (step === 2) {
      if (confirmationText !== requiredText) {
        newErrors.confirmationText = `Please type "${requiredText}" exactly`;
      }
      if (!password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleDelete = async () => {
    if (!validateStep()) return;

    setIsDeleting(true);
    try {
      // Simulate account deletion process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would call the API to delete the account
      console.log('Account deletion initiated', {
        reason,
        confirmationText,
        userEmail: profileData?.email
      });

      setStep(3); // Success step
    } catch (error) {
      console.error('Account deletion failed:', error);
      setErrors({ general: 'Failed to delete account. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setConfirmationText('');
    setPassword('');
    setReason('');
    setErrors({});
    setIsDeleting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Warning: This action cannot be undone</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Deleting your account will permanently remove all your data, including:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                    <li>Profile information and settings</li>
                    <li>SOP access history and preferences</li>
                    <li>Activity logs and analytics data</li>
                    <li>Custom configurations and bookmarks</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you deleting your account? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  'No longer need the service',
                  'Found a better alternative',
                  'Privacy concerns',
                  'Technical issues',
                  'Account security concerns',
                  'Other'
                ].map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={option}
                      checked={reason === option}
                      onChange={(e) => setReason(e.target.value)}
                      className="border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.reason && (
                <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Final Confirmation */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Final Security Check</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Please confirm your identity to proceed with account deletion.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">"{requiredText}"</span> to confirm
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-2 ${
                    errors.confirmationText
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={requiredText}
                />
              </div>
              {errors.confirmationText && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmationText}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Current password"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Deletion Initiated</h3>
            <p className="text-gray-500 mb-4">
              Your account deletion request has been processed. You will be logged out shortly.
            </p>
            <p className="text-sm text-gray-400">
              If you change your mind, contact support within 30 days to recover your account.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;
