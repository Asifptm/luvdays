import React, { useState } from 'react';
import logo from '../logo.svg';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleAuthSuccess = () => {
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src={logo} 
            alt="Days AI Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-lg font-semibold text-gray-800">Days AI</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <button
            onClick={handleSwitchToLogin}
            className={`text-sm font-medium transition-colors ${
              isLogin 
                ? 'text-black' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {/* TODO: Implement help */}}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Help
          </button>
        </div>
      </header>

      {/* Auth Content */}
      <main>
        {isLogin ? (
          <Login 
            onSwitchToSignup={handleSwitchToSignup}
            onLoginSuccess={handleAuthSuccess}
          />
        ) : (
          <Signup 
            onSwitchToLogin={handleSwitchToLogin}
            onSignupSuccess={handleAuthSuccess}
          />
        )}
      </main>
    </div>
  );
};

export default AuthPage;
