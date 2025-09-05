# Session Duration Configuration

## Overview
The application now creates sessions with a **23-day expiration period** for both login and registration.

## Changes Made

### 1. Middleware (`middleware/auth.js`)
- **Function**: `createSession()`
- **Change**: Updated session expiration from 7 days to 23 days
- **Code**: 
  ```javascript
  expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000) // 23 days
  ```

### 2. Session Model (`models/Session.js`)
- **Function**: Pre-save middleware
- **Change**: Updated default expiration from 7 days to 23 days
- **Code**:
  ```javascript
  // Default to 23 days from now
  this.expires_at = new Date(Date.now() + 23 * 24 * 60 * 60 * 1000);
  ```

## Session Lifecycle

### When User Logs In:
1. ✅ **Session Created** - New session with 23-day expiration
2. ✅ **Session Saved** - Stored in MongoDB database
3. ✅ **Frontend Updated** - Session data saved to localStorage
4. ✅ **User Authenticated** - Can access protected routes

### When User Registers:
1. ✅ **User Created** - New user account created
2. ✅ **Session Created** - New session with 23-day expiration
3. ✅ **Session Saved** - Stored in MongoDB database
4. ✅ **Frontend Updated** - Session data saved to localStorage
5. ✅ **User Authenticated** - Can access protected routes

## Session Data Structure

### Backend (MongoDB):
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,           // Reference to User
  platform: String,            // 'web', 'mobile', 'desktop', 'api'
  device_info: {
    ip: String,
    browser: String,
    os: String,
    userAgent: String,
    deviceType: String
  },
  auth_token: String,          // Unique token
  is_active: Boolean,          // Session status
  last_activity_at: Date,      // Last activity
  expires_at: Date,            // Expiration (23 days from creation)
  login_method: String,        // 'email', 'social', 'api'
  metadata: Object             // Additional data
}
```

### Frontend (localStorage):
```javascript
// auth_token: "token_1234567890_abc123def"
// user: { id, email, username, name, ... }
// session: { id, auth_token, expires_at, platform, ... }
```

## Benefits of 23-Day Sessions

1. **Extended User Experience** - Users stay logged in longer
2. **Reduced Login Frequency** - Less friction for returning users
3. **Better User Retention** - Users don't get logged out frequently
4. **Security Balance** - Long enough for convenience, not too long for security

## Testing

### Verification Script:
- **File**: `tests/verify-session-23days.js`
- **Purpose**: Verify sessions are created with 23-day expiration
- **Result**: ✅ Confirmed 23-day expiration working correctly

### Test Results:
```
📊 Days until expiration: 23
✅ Session expiration is correctly set to ~23 days!
```

## Automatic Cleanup

- **Frequency**: Every 6 hours
- **Action**: Removes expired sessions
- **Method**: Sets `is_active: false` for expired sessions
- **Location**: `app.js` - `initializeSessionCleanup()`

## Security Considerations

1. **Session Validation** - Each request validates session expiration
2. **Activity Tracking** - Last activity timestamp updated on each request
3. **Automatic Cleanup** - Expired sessions are automatically deactivated
4. **Manual Revocation** - Users can manually revoke sessions
5. **Device Tracking** - IP, browser, and OS information stored for security

## Configuration

To change the session duration, update these two locations:

1. **`middleware/auth.js`** - Line with `createSession` function
2. **`models/Session.js`** - Pre-save middleware

Example for 30 days:
```javascript
expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
```

## Summary

✅ **Session Duration**: 23 days  
✅ **Login Sessions**: Created and saved automatically  
✅ **Registration Sessions**: Created and saved automatically  
✅ **Frontend Storage**: Session data saved to localStorage  
✅ **Backend Storage**: Session data saved to MongoDB  
✅ **Automatic Cleanup**: Expired sessions cleaned up every 6 hours  
✅ **Security**: Session validation on each request  
✅ **Testing**: Verified working correctly
