import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import AuthService from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      try {
        // First check local authentication
        const localAuth = AuthService.isAuthenticated();
        
        if (localAuth) {
          // If local auth exists, validate with server
          const serverAuth = await AuthService.validateSession();
          setIsAuthenticated(serverAuth);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <LandingPage />
            } 
          />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <AuthPage onAuthSuccess={handleAuthSuccess} />
            } 
          />
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? 
                <ChatPage /> : 
                <Navigate to="/auth" replace />
            } 
          />
          {/* Catch all other routes and redirect */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <Navigate to="/auth" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
