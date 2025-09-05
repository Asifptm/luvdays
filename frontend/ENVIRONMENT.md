# Frontend Environment Configuration

This document explains how to configure environment variables for the frontend application.

## Environment Files

The frontend uses a centralized configuration system located in `src/config/environment.ts`. This file provides default values for all environment variables and can be overridden using `.env` files.

## Setting Up Environment Variables

### Option 1: Using .env.local (Recommended for local development)

Create a `.env.local` file in the frontend root directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Authentication Configuration
REACT_APP_AUTH_BASE_URL=http://localhost:5000/api/auth
REACT_APP_SESSION_DURATION=23

# External Services
REACT_APP_FASTAPI_URL=http://localhost:8000

# App Configuration
REACT_APP_APP_NAME=Days AI
REACT_APP_APP_VERSION=1.0.0
REACT_APP_APP_DESCRIPTION=AI-powered chat application

# Feature Flags
REACT_APP_ENABLE_CHAT_HISTORY=true
REACT_APP_ENABLE_FEEDBACK=true
REACT_APP_ENABLE_SHARING=true
REACT_APP_ENABLE_USER_PROFILES=true

# UI Configuration
REACT_APP_THEME=light
REACT_APP_ENABLE_ANIMATIONS=true
REACT_APP_CHAT_TIMEOUT=30000

# Development Configuration
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug

# Production Configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_SENTRY_DSN=
REACT_APP_GOOGLE_ANALYTICS_ID=
```

### Option 2: Using .env (Alternative)

Create a `.env` file in the frontend root directory with the same variables as above.

### Option 3: System Environment Variables

Set environment variables directly in your system or deployment platform.

## Available Environment Variables

### API Configuration
- `REACT_APP_API_URL`: Base URL for the backend API (default: http://localhost:5000)
- `REACT_APP_API_BASE_URL`: Base URL for API endpoints (default: http://localhost:5000/api)
- `REACT_APP_CHAT_TIMEOUT`: Timeout for chat requests in milliseconds (default: 30000)

### Authentication Configuration
- `REACT_APP_AUTH_BASE_URL`: Base URL for authentication endpoints (default: http://localhost:5000/api/auth)
- `REACT_APP_SESSION_DURATION`: Session duration in days (default: 23)

### External Services
- `REACT_APP_FASTAPI_URL`: URL for external FastAPI service (default: http://localhost:8000)

### App Configuration
- `REACT_APP_APP_NAME`: Application name (default: Days AI)
- `REACT_APP_APP_VERSION`: Application version (default: 1.0.0)
- `REACT_APP_APP_DESCRIPTION`: Application description
- `REACT_APP_ENVIRONMENT`: Environment (development/production)

### Feature Flags
- `REACT_APP_ENABLE_CHAT_HISTORY`: Enable chat history feature (default: true)
- `REACT_APP_ENABLE_FEEDBACK`: Enable feedback feature (default: true)
- `REACT_APP_ENABLE_SHARING`: Enable sharing feature (default: true)
- `REACT_APP_ENABLE_USER_PROFILES`: Enable user profiles (default: true)

### UI Configuration
- `REACT_APP_THEME`: UI theme (default: light)
- `REACT_APP_ENABLE_ANIMATIONS`: Enable UI animations (default: true)

### Development Configuration
- `REACT_APP_DEBUG_MODE`: Enable debug mode (default: false)
- `REACT_APP_LOG_LEVEL`: Logging level (default: info)

### Production Configuration
- `REACT_APP_SENTRY_DSN`: Sentry DSN for error tracking
- `REACT_APP_GOOGLE_ANALYTICS_ID`: Google Analytics ID

## Using Configuration in Components

Import and use the configuration in your components:

```typescript
import config from '../config/environment';

// Access configuration values
const apiUrl = config.api.baseUrl;
const isDebugMode = config.development.debugMode;
const enableChatHistory = config.features.chatHistory;

// Use helper functions
import { isDevelopment, isProduction } from '../config/environment';

if (isDevelopment()) {
  console.log('Running in development mode');
}
```

## Environment File Priority

React environment variables are loaded in this order (highest priority first):
1. `.env.local` (for local development)
2. `.env` (for all environments)
3. System environment variables
4. Default values in `environment.ts`

## Security Notes

- Never commit `.env.local` or `.env` files to version control
- Only use `REACT_APP_` prefix for client-side environment variables
- Sensitive information should be handled server-side
- Use `.env.example` for documentation and team sharing

## Production Deployment

For production deployment, set environment variables in your hosting platform:
- Vercel: Use the Environment Variables section in project settings
- Netlify: Use the Environment Variables section in site settings
- AWS Amplify: Use the Environment Variables section in app settings
- Docker: Pass environment variables during container creation

## Troubleshooting

- Ensure all environment variable names start with `REACT_APP_`
- Restart your development server after changing environment variables
- Check browser console for any configuration-related errors
- Verify that the configuration file is properly imported
