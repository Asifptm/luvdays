# AWS CLI Configuration Script
Write-Host "=== AWS CLI Configuration ===" -ForegroundColor Green
Write-Host ""

# Get AWS Access Key ID
$accessKeyId = Read-Host "Enter your AWS Access Key ID"
if ([string]::IsNullOrWhiteSpace($accessKeyId)) {
    Write-Host "Access Key ID is required!" -ForegroundColor Red
    exit 1
}

# Get AWS Secret Access Key
$secretAccessKey = Read-Host "Enter your AWS Secret Access Key" -AsSecureString
$secretAccessKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretAccessKey))
if ([string]::IsNullOrWhiteSpace($secretAccessKeyPlain)) {
    Write-Host "Secret Access Key is required!" -ForegroundColor Red
    exit 1
}

# Get Default Region
$defaultRegion = Read-Host "Enter default region (default: us-east-1)"
if ([string]::IsNullOrWhiteSpace($defaultRegion)) {
    $defaultRegion = "us-east-1"
}

# Get Default Output Format
$defaultOutput = Read-Host "Enter default output format (default: json)"
if ([string]::IsNullOrWhiteSpace($defaultOutput)) {
    $defaultOutput = "json"
}

Write-Host ""
Write-Host "Configuring AWS CLI..." -ForegroundColor Yellow

# Configure AWS CLI
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure set aws_access_key_id $accessKeyId
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure set aws_secret_access_key $secretAccessKeyPlain
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure set default.region $defaultRegion
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure set default.output $defaultOutput

Write-Host ""
Write-Host "AWS CLI Configuration Complete!" -ForegroundColor Green
Write-Host "Testing configuration..." -ForegroundColor Yellow

# Test configuration
try {
    $result = & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" sts get-caller-identity
    Write-Host "Configuration successful!" -ForegroundColor Green
    Write-Host "Account ID: $($result | ConvertFrom-Json | Select-Object -ExpandProperty Account)"
    Write-Host "User ARN: $($result | ConvertFrom-Json | Select-Object -ExpandProperty Arn)"
} catch {
    Write-Host "Configuration test failed. Please check your credentials." -ForegroundColor Red
}
