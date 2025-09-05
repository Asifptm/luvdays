// Environment Configuration
// This file centralizes all environment variables and provides default values



export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://api.luvdays.com',
    baseApiUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.luvdays.com/api',
    timeout: parseInt(process.env.REACT_APP_CHAT_TIMEOUT || '30000'),
  },

  // Authentication Configuration
  auth: {
    baseUrl: process.env.REACT_APP_AUTH_BASE_URL || 'https://api.luvdays.com/api/auth',
    sessionDuration: parseInt(process.env.REACT_APP_SESSION_DURATION || '23'),
  },

  // External Services
  external: {
    fastApiUrl: process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000',
  },

  // App Configuration
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Days AI',
    version: process.env.REACT_APP_APP_VERSION || '1.0.0',
    description: process.env.REACT_APP_APP_DESCRIPTION || 'AI-powered chat application',
    environment: process.env.REACT_APP_ENVIRONMENT || 'production',
  },

  // Feature Flags
  features: {
    chatHistory: process.env.REACT_APP_ENABLE_CHAT_HISTORY !== 'false',
    feedback: process.env.REACT_APP_ENABLE_FEEDBACK !== 'false',
    sharing: process.env.REACT_APP_ENABLE_SHARING !== 'false',
    userProfiles: process.env.REACT_APP_ENABLE_USER_PROFILES !== 'false',
  },

  // UI Configuration
  ui: {
    theme: process.env.REACT_APP_THEME || 'light',
    enableAnimations: process.env.REACT_APP_ENABLE_ANIMATIONS !== 'false',
  },

  // Development Configuration
  development: {
    debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
    logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
  },

  // Production Configuration
  production: {
    sentryDsn: process.env.REACT_APP_SENTRY_DSN || '',
    googleAnalyticsId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID || '',
  },
};

// Helper function to get environment variable with fallback
export const getEnvVar = (key: string, fallback: string = ''): string => {
  return process.env[key] || fallback;
};

// Helper function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return config.app.environment === 'development';
};

// Helper function to check if we're in production mode
export const isProduction = (): boolean => {
  return config.app.environment === 'production';
};



export default config;
