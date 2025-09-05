# 🌐 Custom Domain Setup Guide for Days AI

## 🎯 **Overview**
This guide will help you set up custom domains for your Days AI application:
- **Frontend**: `app.luvdays.com`
- **Backend**: `api.luvdays.com`

## 📋 **Prerequisites**
1. **Domain Name**: You need to own a domain (e.g., `daysai.com`)
2. **AWS Account**: With appropriate permissions
3. **AWS CLI**: Configured with your credentials

## 🚀 **Step-by-Step Setup**

### **Step 1: Domain Registration & Route 53 Setup**
```bash
# If you don't have a domain, register one in Route 53
# If you have a domain elsewhere, transfer it to Route 53 for easier management
```

### **Step 2: Create SSL Certificate**
```bash
# Request a certificate in ACM (AWS Certificate Manager)
# Domain: *.luvdays.com (covers all subdomains)
# Validation: DNS validation (recommended)
# Region: ap-south-1 (same as your backend)
```

### **Step 3: Install Required Plugins**
```bash
# Backend directory
npm install --save-dev serverless-domain-manager

# Frontend directory
npm install --save-dev @aws-sdk/client-cloudfront
```

### **Step 4: Deploy Backend with Custom Domain**
```bash
# Backend directory
npx serverless deploy --stage prod --region ap-south-1 --config serverless-custom-domain.yml
```

### **Step 5: Deploy Frontend with CloudFront**
```bash
# Frontend directory
aws cloudformation deploy \
  --template-file cloudfront-custom-domain.yml \
  --stack-name daysai-frontend-custom-domain \
  --parameter-overrides \
    DomainName=app.luvdays.com \
    CertificateArn=YOUR_CERTIFICATE_ARN \
    S3BucketName=daysfrontend \
  --capabilities CAPABILITY_IAM
```

### **Step 6: Update Frontend Environment**
```typescript
// frontend/src/config/environment.ts
export const config = {
  api: {
    baseUrl: 'https://api.luvdays.com',
    baseApiUrl: 'https://api.luvdays.com/api',
  },
  auth: {
    baseUrl: 'https://api.luvdays.com/api/auth',
  },
  // ... rest of config
};
```

### **Step 7: Update CORS Settings**
```yaml
# backend/serverless-custom-domain.yml
environment:
  CORS_ORIGIN: https://app.luvdays.com
```

## 🔧 **Configuration Files**

### **Backend Custom Domain** (`serverless-custom-domain.yml`)
- Custom domain: `api.luvdays.com`
- SSL certificate integration
- Route 53 automatic record creation

### **Frontend CloudFront** (`cloudfront-custom-domain.yml`)
- Custom domain: `app.luvdays.com`
- S3 origin with SPA routing
- SSL termination
- Global CDN distribution

## 🌍 **Final URLs**
- **Frontend**: `https://app.luvdays.com`
- **Backend API**: `https://api.luvdays.com`
- **Health Check**: `https://api.luvdays.com/health`

## ✅ **Verification Steps**
1. **DNS Resolution**: Check if domains resolve correctly
2. **SSL Certificates**: Verify HTTPS works
3. **API Connectivity**: Test backend endpoints
4. **Frontend Loading**: Ensure frontend loads from custom domain

## 🚨 **Important Notes**
- **SSL Certificates**: Must be in the same region as your resources
- **DNS Propagation**: Can take up to 48 hours
- **Costs**: CloudFront and Route 53 have associated costs
- **Backup**: Keep your current working setup until custom domain is verified

## 🆘 **Troubleshooting**
- **Certificate Issues**: Ensure certificate is validated and in correct region
- **DNS Issues**: Check Route 53 hosted zone configuration
- **CORS Errors**: Verify CORS_ORIGIN matches your frontend domain
- **CloudFront Issues**: Check distribution status and error pages

## 💰 **Estimated Monthly Costs**
- **Route 53**: $0.50 per hosted zone + $0.40 per million queries
- **CloudFront**: $0.085 per GB transferred + $0.0075 per 10,000 requests
- **SSL Certificate**: Free (AWS managed)

Would you like me to help you with any specific step or do you have questions about the setup process?
