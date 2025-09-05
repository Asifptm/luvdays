# PowerShell script to set up environment variables for frontend development
# Run this script from the frontend directory

Write-Host "Setting up environment variables for Days AI Frontend..." -ForegroundColor Green

# Create .env.local file if it doesn't exist
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating $envFile file..." -ForegroundColor Yellow
    
    $envContent = @"
# Frontend Environment Variables - Local Development
# This file contains actual values for local development

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
"@

    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "$envFile created successfully!" -ForegroundColor Green
} else {
    Write-Host "$envFile already exists. Skipping creation." -ForegroundColor Yellow
}

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
Write-Host "You can now customize the values in $envFile as needed." -ForegroundColor Cyan
Write-Host "Remember to restart your development server after making changes." -ForegroundColor Cyan
