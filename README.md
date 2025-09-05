# Days AI Chat Application

A full-stack AI chat application built with React, Node.js, and MongoDB, organized with a clean folder structure for easy deployment and maintenance.

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

## Features

- 🔐 **Session-Based Authentication**: Secure session management with device tracking
- 👥 **User Management**: Profile management with social media account integration
- 💬 **Chat System**: Direct messages, group chats, and AI conversations
- 🤖 **AI Integration**: Built-in AI chat functionality (easily extensible)
- 🔗 **Social Media Integration**: Connect Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube
- 🔒 **Security**: Rate limiting, input validation, and session management
- 📊 **Admin Panel**: User statistics and management for administrators
- 🚀 **RESTful API**: Clean and well-documented API endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Session-based with device tracking
- **Security**: helmet, express-rate-limit
- **Validation**: express-validator

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd days-ai-chat
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all
```

### 3. Environment Configuration
```bash
# Backend environment variables
cd backend
cp env.template .env
# Edit .env with your actual values
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 3000
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

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| POST | `/api/auth/connected-accounts` | Add social media account | Private |
| DELETE | `/api/auth/connected-accounts/:platform` | Remove social media account | Private |
| GET | `/api/auth/sessions` | Get user sessions | Private |
| DELETE | `/api/auth/sessions/:sessionId` | Logout from specific session | Private |
| POST | `/api/auth/logout` | Logout (current session) | Private |
| POST | `/api/auth/logout-all` | Logout from all sessions | Private |

### Chat Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/chat` | Get all user chats | Private |
| POST | `/api/chat` | Create new chat | Private |
| GET | `/api/chat/:chatId` | Get chat with messages | Private |
| POST | `/api/chat/:chatId/messages` | Send message | Private |
| POST | `/api/chat/:chatId/ai-message` | Send AI message | Private |
| PUT | `/api/chat/:chatId/ai-settings` | Update AI settings | Private |
| DELETE | `/api/chat/:chatId` | Delete chat | Private |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/user/search` | Search users | Private |
| GET | `/api/user/:userId` | Get user profile | Private |
| GET | `/api/user/online` | Get online users | Private |
| GET | `/api/user/recent` | Get recent users | Private |
| PUT | `/api/user/status` | Update online status | Private |
| GET | `/api/user/stats` | Get user statistics | Admin |
| GET | `/api/user/all` | Get all users | Admin |
| PUT | `/api/user/:userId/role` | Update user role | Admin |

## Request/Response Examples

### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f4a12c8a3bcd1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "connected_accounts": [],
      "avatar": null,
      "isOnline": false,
      "lastSeen": "2025-08-14T10:00:00.000Z",
      "role": "user",
      "isVerified": false,
      "created_at": "2025-08-14T10:00:00.000Z"
    },
    "session": {
      "auth_token": "token_1692014400000_abc123def",
      "expires_at": "2025-08-21T10:00:00.000Z"
    }
  }
}
```

### User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Add Connected Account
```bash
POST /api/auth/connected-accounts
Authorization: Bearer <auth_token>
Content-Type: application/json

{
  "platform": "instagram",
  "username": "john_doe",
  "profile_url": "https://instagram.com/john_doe"
}
```

### Create AI Chat
```bash
POST /api/chat
Authorization: Bearer <auth_token>
Content-Type: application/json

{
  "chatType": "ai_chat"
}
```

### Send AI Message
```bash
POST /api/chat/:chatId/ai-message
Authorization: Bearer <auth_token>
Content-Type: application/json

{
  "content": "Hello, how can you help me today?",
  "messageType": "text"
}
```

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  name: String (required),
  connected_accounts: [{
    platform: String (enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube']),
    username: String,
    profile_url: String
  }],
  avatar: String,
  isOnline: Boolean,
  lastSeen: Date,
  role: String (enum: ['user', 'admin']),
  isVerified: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Session Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  platform: String (enum: ['web', 'mobile', 'desktop', 'api']),
  device_info: {
    ip: String,
    browser: String,
    os: String,
    userAgent: String,
    deviceType: String (enum: ['desktop', 'mobile', 'tablet'])
  },
  auth_token: String (unique),
  is_active: Boolean,
  last_activity_at: Date,
  expires_at: Date,
  login_method: String (enum: ['email', 'social', 'api']),
  metadata: Mixed,
  created_at: Date,
  updated_at: Date
}
```

### Chat Model
```javascript
{
  participants: [ObjectId (ref: User)],
  messages: [{
    sender: ObjectId (ref: User),
    content: String,
    messageType: String (enum: ['text', 'image', 'file', 'ai_response']),
    isAI: Boolean,
    aiModel: String,
    metadata: Mixed,
    readBy: [{
      user: ObjectId (ref: User),
      readAt: Date
    }],
    createdAt: Date
  }],
  chatType: String (enum: ['direct', 'group', 'ai_chat']),
  chatName: String,
  isActive: Boolean,
  lastMessage: ObjectId,
  lastMessageAt: Date,
  aiSettings: {
    model: String,
    temperature: Number,
    maxTokens: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Session Management**: Secure session-based authentication with device tracking
- **Rate Limiting**: Prevents abuse with request rate limiting
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers for Express.js
- **Environment Variables**: Sensitive data stored in environment variables
- **Device Tracking**: Track and manage user sessions across devices

## Social Media Integration

The backend supports connecting social media accounts:

- **Instagram**: Connect Instagram profiles
- **Facebook**: Link Facebook accounts
- **Twitter**: Connect Twitter handles
- **LinkedIn**: Link LinkedIn profiles
- **TikTok**: Connect TikTok accounts
- **YouTube**: Link YouTube channels

## AI Integration

The backend includes a placeholder AI response generator. To integrate with real AI services:

1. **OpenAI Integration**: Replace the `generateAIResponse` function in `routes/chat.js`
2. **Claude Integration**: Add Anthropic's Claude API
3. **Custom AI Models**: Integrate your own AI models

Example OpenAI integration:
```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateAIResponse(userMessage, aiSettings) {
  const completion = await openai.chat.completions.create({
    model: aiSettings.model || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: userMessage }],
    temperature: aiSettings.temperature || 0.7,
    max_tokens: aiSettings.maxTokens || 1000,
  });
  
  return completion.choices[0].message.content;
}
```

## Error Handling

The API uses consistent error responses:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing the API
Use tools like Postman, Insomnia, or curl to test the endpoints.

### Health Check
```bash
GET http://localhost:5000/api/health
```

## Production Deployment

1. **Environment Variables**: Update `config.env` with production values
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **Process Manager**: Use PM2 or similar for process management
4. **Reverse Proxy**: Use Nginx or Apache as reverse proxy
5. **SSL**: Configure HTTPS with SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
