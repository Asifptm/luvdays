# 🚀 Days AI Chat - Deployment Guide

## 📁 Project Structure

```
days-ai-chat/
├── backend/                 # Backend API (Node.js + Express)
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server startup
│   ├── lambda.js           # AWS Lambda handler
│   ├── serverless.yml      # Serverless Framework config
│   ├── package.json        # Backend dependencies
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # External services
│   ├── tests/             # Backend tests
│   └── docs/              # Backend documentation
├── frontend/               # Frontend (React + TypeScript)
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── build/             # Build output
├── package.json           # Root package.json
└── README.md              # Project documentation
```

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all
```

### 2. Environment Configuration
```bash
# Backend environment variables
cd backend
cp env.template .env
# Edit .env with your actual values
```

### 3. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 3000
```

## ☁️ AWS Deployment

### Backend Deployment (AWS Lambda)

1. **Configure AWS Credentials**
```bash
aws configure
```

2. **Set Environment Variables**
```bash
cd backend
cp env.template .env
# Edit .env with production values
```

3. **Deploy Backend**
```bash
# From root directory
npm run deploy:backend

# Or from backend directory
cd backend
npm run deploy
```

### Frontend Deployment (S3 + CloudFront)

1. **Create S3 Bucket**
```bash
aws s3 mb s3://your-days-ai-frontend-bucket --region us-east-1
```

2. **Configure CloudFront Distribution**
- Go to AWS CloudFront console
- Create distribution pointing to S3 bucket
- Set default root object to `index.html`

3. **Update Deployment Configuration**
Edit `frontend/package.json`:
```json
"deploy": "npm run build && aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete --cache-control \"max-age=31536000,public\" && aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths \"/*\""
```

4. **Deploy Frontend**
```bash
# From root directory
npm run deploy:frontend

# Or from frontend directory
cd frontend
npm run deploy
```

## 🔧 Available Scripts

### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build frontend
npm run install:all      # Install all dependencies
npm run deploy:backend   # Deploy backend to AWS Lambda
npm run deploy:frontend  # Deploy frontend to S3
```

### Backend Scripts
```bash
cd backend
npm start               # Start production server
npm run dev             # Start development server
npm run deploy          # Deploy to AWS Lambda (prod)
npm run deploy:dev      # Deploy to AWS Lambda (dev)
npm run offline         # Start serverless offline
```

### Frontend Scripts
```bash
cd frontend
npm start               # Start development server
npm run build           # Build for production
npm run deploy          # Deploy to S3 + CloudFront
```

## 🔒 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/days-ai
FASTAPI_URL=https://your-fastapi-endpoint.com
SESSION_SECRET=your-super-secure-session-secret
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend Configuration
Update `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-api-gateway-url.amazonaws.com/prod';
```

## 📊 Monitoring

### Backend Monitoring
- **CloudWatch Logs**: Monitor Lambda function logs
- **API Gateway**: Monitor API requests and errors
- **Lambda Metrics**: Function duration, errors, invocations

### Frontend Monitoring
- **CloudFront**: Monitor CDN performance
- **S3**: Monitor storage usage
- **Route 53**: Monitor DNS resolution

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend domain is allowed

2. **MongoDB Connection**
   - Verify MongoDB Atlas network access
   - Check connection string format

3. **Lambda Timeout**
   - Increase timeout in `backend/serverless.yml`
   - Optimize database queries

4. **Build Errors**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall

### Useful Commands
```bash
# View Lambda logs
cd backend
serverless logs -f api

# Test Lambda locally
cd backend
npm run offline

# Remove deployment
cd backend
serverless remove

# Check AWS credentials
aws sts get-caller-identity
```

## 🌐 Make Your Domain Publicly Accessible & Visible to Google

1. **Set Up a Custom Domain**
   - Register your domain (e.g., with Route 53 or another registrar).
   - In AWS Route 53, create a hosted zone for your domain.
   - Point your domain’s DNS records (A/AAAA/CNAME) to your CloudFront distribution or API Gateway endpoint.

2. **Enable HTTPS with SSL Certificate**
   - Use AWS Certificate Manager (ACM) to request an SSL certificate for your domain.
   - Attach the certificate to your CloudFront distribution or API Gateway.

3. **Configure CloudFront for Public Access**
   - Ensure your CloudFront distribution is set to allow public access.
   - Set the default root object (e.g., `index.html`) for your frontend.

4. **Allow Search Engine Indexing**
   - Make sure your frontend app does **not** include a `robots.txt` file that blocks all crawlers.
   - Optionally, add a `robots.txt` file at the root of your frontend build with:
     ```
     User-agent: *
     Allow: /
     ```
   - Add relevant `<meta>` tags in your HTML for SEO (e.g., `description`, `keywords`).

5. **Submit Your Site to Google**
   - Go to [Google Search Console](https://search.google.com/search-console/about).
   - Add your domain as a new property.
   - Verify ownership (using DNS, HTML file, or meta tag).
   - Submit your sitemap (e.g., `https://your-domain.com/sitemap.xml`) if available.

---

**🌟 Your Days AI Chat application is now live and discoverable by users and search engines!**
