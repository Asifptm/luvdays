# 🚀 AWS Deployment Guide for Days AI Chat Application

## 📋 Prerequisites

### 1. AWS Account Setup
- [ ] AWS Account created
- [ ] AWS CLI installed and configured
- [ ] IAM user with appropriate permissions
- [ ] Access keys configured

### 2. Required Tools
- [ ] Node.js 18+ installed
- [ ] Serverless Framework installed: `npm install -g serverless`
- [ ] Git repository ready

## 🔧 Backend Deployment (AWS Lambda)

### Step 1: Install Dependencies
```bash
# Install serverless dependencies
npm install serverless-http serverless-offline --save-dev
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
FASTAPI_URL=your_fastapi_endpoint
SESSION_SECRET=your_secure_session_secret
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### Step 3: Deploy Backend
```bash
# Deploy to AWS Lambda
./deploy-backend.sh
```

### Step 4: Update Frontend API URL
After deployment, update the API URL in `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-api-gateway-url.amazonaws.com/prod';
```

## 🌐 Frontend Deployment (S3 + CloudFront)

### Step 1: Create S3 Bucket
```bash
# Create S3 bucket for frontend
aws s3 mb s3://your-days-ai-frontend-bucket --region us-east-1

# Configure bucket for static website hosting
aws s3 website s3://your-days-ai-frontend-bucket --index-document index.html --error-document index.html
```

### Step 2: Create CloudFront Distribution
1. Go to AWS CloudFront console
2. Create a new distribution
3. Origin: Your S3 bucket
4. Default root object: `index.html`
5. Error pages: Redirect to `index.html` (for SPA routing)

### Step 3: Update Deployment Script
Edit `frontend/build/deploy.sh`:
```bash
BUCKET_NAME="your-days-ai-frontend-bucket"
DISTRIBUTION_ID="your-cloudfront-distribution-id"
```

### Step 4: Deploy Frontend
```bash
# Make script executable
chmod +x frontend/build/deploy.sh

# Deploy frontend
./frontend/build/deploy.sh
```

## 🔒 Security Configuration

### 1. CORS Settings
Update CORS in your backend to allow your frontend domain:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### 2. Environment Variables
Ensure all sensitive data is in environment variables:
- MongoDB connection string
- Session secrets
- API keys
- CORS origins

### 3. IAM Permissions
Ensure your Lambda function has minimal required permissions:
- CloudWatch Logs
- VPC access (if using VPC)
- Any additional AWS services you're using

## 📊 Monitoring & Logging

### 1. CloudWatch Logs
- Monitor Lambda function logs
- Set up log retention policies
- Create log filters for errors

### 2. CloudWatch Metrics
- Monitor function duration
- Track error rates
- Set up alarms for critical metrics

### 3. Application Monitoring
- Consider using AWS X-Ray for tracing
- Set up health check endpoints
- Monitor API Gateway metrics

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm install -g serverless
      - run: serverless deploy --stage prod
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          FASTAPI_URL: ${{ secrets.FASTAPI_URL }}
          SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
          CORS_ORIGIN: ${{ secrets.CORS_ORIGIN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - run: aws s3 sync frontend/build/ s3://your-bucket-name --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend domain is allowed

2. **MongoDB Connection Issues**
   - Verify MongoDB Atlas network access
   - Check connection string format

3. **Lambda Timeout**
   - Increase timeout in serverless.yml
   - Optimize database queries

4. **Cold Start Issues**
   - Use provisioned concurrency
   - Optimize function size

### Useful Commands
```bash
# Test Lambda locally
serverless offline

# View logs
serverless logs -f api

# Remove deployment
serverless remove

# Update environment variables
serverless deploy function --function api
```

## 📈 Performance Optimization

### 1. Lambda Optimization
- Use connection pooling for MongoDB
- Implement proper error handling
- Optimize bundle size

### 2. Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement proper caching headers

### 3. Database Optimization
- Use MongoDB indexes
- Implement connection pooling
- Monitor query performance

## 🎯 Next Steps

1. **Domain Setup**: Configure custom domain with Route 53
2. **SSL Certificate**: Set up SSL with AWS Certificate Manager
3. **Monitoring**: Implement comprehensive monitoring
4. **Backup Strategy**: Set up database backups
5. **Security**: Implement additional security measures

## 📞 Support

For issues or questions:
- Check AWS Lambda documentation
- Review CloudWatch logs
- Monitor application metrics
- Test endpoints thoroughly

---

**🎉 Congratulations! Your Days AI Chat application is now deployed on AWS!**
## 🌐 Make Your App Publicly Accessible & Visible on Google

After deploying and hosting your app, follow these steps to set up your custom domain and ensure your site is discoverable by search engines:

### 1. Set Up a Custom Domain
- Register a domain (e.g., via AWS Route 53 or another registrar).
- In AWS Route 53, create a hosted zone for your domain.
- Point your domain’s DNS records (A/AAAA/CNAME) to your CloudFront distribution or API Gateway endpoint.

### 2. Enable HTTPS with SSL Certificate
- Use AWS Certificate Manager (ACM) to request an SSL certificate for your domain.
- Attach the certificate to your CloudFront distribution or API Gateway.

### 3. Configure CloudFront for Public Access
- Ensure your CloudFront distribution allows public access.
- Set the default root object (e.g., `index.html`) for your frontend.

### 4. Allow Search Engine Indexing
- Make sure your frontend app does **not** include a `robots.txt` file that blocks all crawlers.
- Optionally, add a `robots.txt` file at the root of your frontend build with:
  ```
  User-agent: *
  Allow: /
  ```
- Add relevant `<meta>` tags in your HTML for SEO (e.g., `description`, `keywords`).

### 5. Submit Your Site to Google
- Go to [Google Search Console](https://search.google.com/search-console/about).
- Add your domain as a new property.
- Verify ownership (using DNS, HTML file, or meta tag).
- Submit your sitemap (e.g., `https://your-domain.com/sitemap.xml`) if available.

---

**🌟 Your Days AI Chat application is now live and discoverable by users and search engines!**
