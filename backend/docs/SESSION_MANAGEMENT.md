# Session Management System

## Overview

The AI Chat Hub application includes a comprehensive session management system that creates and manages user sessions when users register or login. This system ensures secure authentication, tracks user activity, and provides session monitoring capabilities.

## Features

### ✅ Already Implemented

1. **Automatic Session Creation**
   - Sessions are automatically created when users register
   - Sessions are automatically created when users login
   - Each session includes device information (IP, browser, OS)
   - Sessions have a 7-day expiration period

2. **Session Storage**
   - Sessions are saved to MongoDB database
   - Frontend stores session data in localStorage
   - Session data includes auth token, expiration, and device info

3. **Session Validation**
   - Automatic session expiration checking
   - Token validation on each request
   - Session activity tracking

4. **Session Management**
   - Users can view all their active sessions
   - Users can revoke individual sessions
   - Session statistics and monitoring
   - Automatic cleanup of expired sessions

## Architecture

### Backend Components

#### Session Model (`models/Session.js`)
```javascript
const sessionSchema = new mongoose.Schema({
  user_id: ObjectId,           // Reference to User
  platform: String,            // 'web', 'mobile', 'desktop', 'api'
  device_info: {               // Device information
    ip: String,
    browser: String,
    os: String,
    userAgent: String,
    deviceType: String
  },
  auth_token: String,          // Unique authentication token
  is_active: Boolean,          // Session status
  last_activity_at: Date,      // Last activity timestamp
  expires_at: Date,            // Session expiration
  login_method: String,        // 'email', 'social', 'api'
  metadata: Object             // Additional session data
});
```

#### Session Creation (`middleware/auth.js`)
```javascript
const createSession = async (userId, platform, deviceInfo, loginMethod = 'email') => {
  const authToken = generateAuthToken();
  
  const session = new Session({
    user_id: userId,
    platform,
    device_info: deviceInfo,
    auth_token: authToken,
    login_method: loginMethod,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  await session.save();
  return session;
};
```

#### Authentication Controller (`controllers/authController.js`)
- `registerUser()`: Creates user and session on registration
- `loginUser()`: Creates new session on login
- `logoutUser()`: Deactivates current session
- `getUserSessions()`: Returns all user sessions
- `revokeSession()`: Deactivates specific session

### Frontend Components

#### AuthContext (`frontend/src/contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string) => Promise<void>;
  register: (email: string, username: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

#### Session Manager Component (`frontend/src/components/SessionManager.tsx`)
- Displays session statistics
- Shows current session information
- Lists all user sessions
- Allows session revocation

## Session Lifecycle

### 1. Registration Flow
```
User registers → Create user → Create session → Return user + session data
```

### 2. Login Flow
```
User logs in → Find user → Create new session → Return user + session data
```

### 3. Session Validation
```
Request with token → Validate token → Check expiration → Update activity → Continue
```

### 4. Session Cleanup
```
Scheduled job (every 6 hours) → Find expired sessions → Mark as inactive
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user and create session
- `POST /api/auth/login` - Login user and create session
- `POST /api/auth/logout` - Deactivate current session

### Session Management
- `GET /api/auth/sessions` - Get user's active sessions
- `DELETE /api/auth/sessions/:sessionId` - Revoke specific session
- `POST /api/auth/refresh-session` - Refresh current session
- `GET /api/sessions/stats` - Get session statistics

## Security Features

### Token Security
- Unique auth tokens generated for each session
- Tokens include timestamp and random string
- Format: `token_[timestamp]_[random]`

### Session Security
- Automatic expiration after 7 days
- Activity tracking and validation
- Device information logging
- Session revocation capabilities

### Data Protection
- Sessions are stored securely in MongoDB
- Sensitive data is not exposed in responses
- Automatic cleanup of expired sessions

## Monitoring and Statistics

### Session Statistics
- Total sessions count
- Active sessions count
- Expired sessions count
- Last cleanup timestamp

### Session Information
- Device details (browser, OS, IP)
- Platform information
- Login method
- Creation and expiration dates
- Last activity timestamp

## Usage Examples

### Creating a Session (Backend)
```javascript
const deviceInfo = {
  ip: req.ip,
  browser: 'Chrome',
  os: 'Windows'
};

const session = await createSession(userId, 'web', deviceInfo, 'email');
```

### Managing Sessions (Frontend)
```typescript
// Get user sessions
const response = await apiService.getUserSessions();

// Revoke a session
await apiService.revokeSession(sessionId);

// Get session statistics
const stats = await apiService.getSessionStats();
```

### Session Validation (Frontend)
```typescript
// Check if session is expired
const sessionExpiry = new Date(session.expires_at);
const now = new Date();

if (sessionExpiry > now) {
  // Session is valid
} else {
  // Session is expired, clear auth data
  clearAuthData();
}
```

## Testing

The session management system includes comprehensive tests in `tests/session-test.js`:

- Session creation tests
- Session validation tests
- Session management tests
- Session cleanup tests
- Auth token generation tests

Run tests with:
```bash
npm test tests/session-test.js
```

## Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

### Session Settings
- Default expiration: 7 days
- Cleanup interval: 6 hours
- Platform types: web, mobile, desktop, api
- Login methods: email, social, api

## Best Practices

1. **Always validate sessions** before processing requests
2. **Update session activity** on each authenticated request
3. **Clean up expired sessions** regularly
4. **Log device information** for security monitoring
5. **Allow users to revoke sessions** for security
6. **Use HTTPS** in production for secure token transmission

## Troubleshooting

### Common Issues

1. **Session not found**
   - Check if session is expired
   - Verify auth token is correct
   - Ensure session is active

2. **Session creation fails**
   - Check MongoDB connection
   - Verify user exists
   - Check for duplicate auth tokens

3. **Session cleanup not working**
   - Verify scheduled job is running
   - Check MongoDB permissions
   - Review cleanup logs

### Debug Commands

```javascript
// Check session statistics
GET /api/sessions/stats

// View user sessions
GET /api/auth/sessions

// Test token generation
GET /api/auth/test-tokens
```

## Future Enhancements

1. **Session Analytics**
   - Track session patterns
   - Monitor suspicious activity
   - Generate usage reports

2. **Advanced Security**
   - IP-based session restrictions
   - Geographic session validation
   - Multi-factor authentication

3. **Session Synchronization**
   - Cross-device session sync
   - Real-time session updates
   - Push notifications for new sessions

## Support

For issues or questions about the session management system, please refer to:
- API documentation
- Test files for examples
- Backend logs for debugging
- Frontend console for client-side issues
