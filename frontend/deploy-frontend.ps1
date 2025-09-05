# Frontend Deployment Script for Days AI
# This script deploys the frontend to AWS S3

Write-Host "Deploying Days AI Frontend to AWS S3..." -ForegroundColor Green

# Set environment variables for production build
$env:REACT_APP_API_URL = "https://xtk2fsa7ke.execute-api.ap-south-1.amazonaws.com"
$env:REACT_APP_API_BASE_URL = "https://xtk2fsa7ke.execute-api.ap-south-1.amazonaws.com/api"
$env:REACT_APP_AUTH_BASE_URL = "https://xtk2fsa7ke.execute-api.ap-south-1.amazonaws.com/api/auth"
$env:REACT_APP_ENVIRONMENT = "production"
$env:REACT_APP_DEBUG_MODE = "false"

Write-Host "Building frontend for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green


# Check if S3 bucket exists, create if it doesn't
Write-Host "Checking S3 bucket: daysfrontend..." -ForegroundColor Yellow
$bucketExists = aws s3 ls s3://daysfrontend 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating new S3 bucket: daysfrontend..." -ForegroundColor Yellow
    aws s3 mb s3://daysfrontend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create S3 bucket: daysfrontend" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "S3 bucket already exists, skipping creation..." -ForegroundColor Green
}

# Deploy to new S3 bucket
Write-Host "Deploying to S3 bucket: daysfrontend" -ForegroundColor Yellow
aws s3 sync build/ s3://daysfrontend --delete --cache-control "max-age=31536000,public"

if ($LASTEXITCODE -ne 0) {
    Write-Host "S3 sync failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment successful!" -ForegroundColor Green
Write-Host "Your frontend is now live at: http://daysfrontend.s3-website-ap-south-1.amazonaws.com" -ForegroundColor Cyan
