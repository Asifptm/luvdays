import React, { useState } from 'react';
import { Mail, User, UserCheck } from 'lucide-react';
import AuthService from '../../services/authService';
import Toast from '../ui/Toast';

interface SignupProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.register({
        email,
        username,
        name,
      });
      setToast({
        type: 'success',
        message: 'Account created successfully! Redirecting...',
        isVisible: true
      });
      // Delay redirect to show success message
      setTimeout(() => {
        onSignupSuccess();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
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

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Decorative Elements */}
      <div className="absolute bottom-8 right-8 opacity-20">
        <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-2 border-black transform rotate-45"></div>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Sign up with your email</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          {/* Legal Text */}
          <div className="text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <button className="text-black hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-black hover:underline">Privacy Policy</button>
          </div>

          {/* Login Link */}
          <div className="text-center text-gray-600">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-black font-semibold hover:underline focus:outline-none"
            >
              Login
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
        duration={toast.type === 'success' ? 1500 : 5000}
      />
    </div>
  );
};

export default Signup;
