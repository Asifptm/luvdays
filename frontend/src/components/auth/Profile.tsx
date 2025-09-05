import React, { useState } from 'react';
import { User, Mail, Calendar, LogOut, Settings, Edit } from 'lucide-react';
import AuthService, { User as UserType } from '../../services/authService';
import Toast from '../ui/Toast';

interface ProfileProps {
  user: UserType;
  onLogout: () => void;
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');

    try {
      await AuthService.updateProfile({ name });
      setIsEditing(false);
      setToast({
        type: 'success',
        message: 'Profile updated successfully!',
        isVisible: true
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      setToast({
        type: 'error',
        message: errorMessage,
        isVisible: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setToast({
        type: 'success',
        message: 'Logged out successfully!',
        isVisible: true
      });
      // Delay logout to show success message
      setTimeout(() => {
        onLogout();
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      setToast({
        type: 'error',
        message: 'Logout failed, but you have been logged out locally.',
        isVisible: true
      });
      // Still logout locally even if server call fails
      setTimeout(() => {
        onLogout();
      }, 2000);
    }
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Name</span>
              </div>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{user.name}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>

            {/* Username */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Username</span>
              </div>
              <span className="text-sm text-gray-900">@{user.username}</span>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Member Since</span>
              </div>
              <span className="text-sm text-gray-900">{formatDate(user.created_at)}</span>
            </div>

            {/* Online Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-900">
                  {user.is_online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {/* TODO: Implement settings */}}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
        duration={toast.type === 'success' ? 3000 : 5000}
      />
    </div>
  );
};

export default Profile;
