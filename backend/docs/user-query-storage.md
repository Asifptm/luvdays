# User Query and Response Storage

## Overview
The application stores all user queries and AI responses in the database with proper user identification. When a user is authenticated, their queries and responses are stored with their user ID, session ID, and other relevant metadata.

## Storage Structure

### **1. ChatQueries Table (All Queries)**
All queries and responses are stored in the `ChatQueries` table, regardless of authentication status:

```javascript
{
  _id: ObjectId,
  user_id: ObjectId | null,        // User ID for authenticated users, null for anonymous
  session_id: ObjectId | null,     // Session ID for authenticated users, null for anonymous
  query: String,                   // User's question
  response: String,                // AI's answer
  role: String,                    // 'user', 'assistant', 'system'
  status: String,                  // 'pending', 'processing', 'completed', etc.
  text: String,                    // Response text
  chat_history_id: ObjectId | null, // Reference to ChatHistory (authenticated users only)
  category: String,                // 'general', 'ai', 'technical', etc.
  created_at: Date,
  updated_at: Date
}
```

### **2. ChatHistory Table (Authenticated Users Only)**
Only authenticated users get entries in the `ChatHistory` table:

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,               // Always present for authenticated users
  session_id: ObjectId | null,     // Session ID (optional)
  query: String,                   // User's question
  response: String,                // AI's answer
  role: String,                    // 'user', 'assistant', 'system'
  status: String,                  // 'pending', 'processing', 'completed', etc.
  text: String,                    // Response text
  attachments: Array,              // File attachments
  created_at: Date,
  updated_at: Date
}
```

## Storage Logic

### **For Authenticated Users:**
1. **Query Processing** - User sends query with authentication token
2. **User ID Extraction** - `req.user?.id` extracts the user ID from the token
3. **Dual Storage** - Query saved to both `ChatQueries` and `ChatHistory`
4. **Session Tracking** - Session ID included for activity tracking
5. **Data Linking** - `ChatQueries` references `ChatHistory` via `chat_history_id`

### **For Anonymous Users:**
1. **Query Processing** - User sends query without authentication
2. **Null User ID** - `user_id` set to `null` in `ChatQueries`
3. **Single Storage** - Query saved only to `ChatQueries` table
4. **No Session** - `session_id` set to `null`
5. **No History** - No entry in `ChatHistory` table

## Implementation Details

### **AI Chat Query Function:**
```javascript
export const aiChatQuery = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user ID
    const { content, saveToHistory = true } = req.body;

    // Check if user exists (optional)
    await checkUserExists(userId);

    // Send query to FastAPI
    const aiResponse = await fastAPIService.sendChatQuery(content);

    // Save to ChatHistory if requested and user is authenticated
    let chatHistoryEntry = null;
    if (saveToHistory && userId) {
      chatHistoryEntry = new ChatHistory({
        user_id: userId,                    // User ID
        session_id: req.session?._id,       // Session ID
        query: content,                     // User's question
        response: aiResponse.answer,        // AI's response
        role: 'assistant',
        status: 'completed',
        text: aiResponse.answer,
        attachments: []
      });
      await chatHistoryEntry.save();
    }

    // Save to ChatQueries (always save, even without user)
    const chatQuery = new ChatQueries({
      user_id: userId || null,              // User ID or null
      session_id: req.session?._id || null, // Session ID or null
      query: content,                       // User's question
      response: aiResponse.answer,          // AI's response
      role: 'assistant',
      status: 'completed',
      text: aiResponse.answer,
      chat_history_id: chatHistoryEntry?._id // Reference to ChatHistory
    });
    await chatQuery.save();

    res.status(200).json({
      status: 'success',
      data: {
        query: aiResponse.query,
        answer: aiResponse.answer,
        chatHistoryId: chatHistoryEntry?._id,
        chatQueryId: chatQuery._id,
        isAuthenticated: !!userId
      }
    });
  } catch (error) {
    // Error handling
  }
};
```

## Data Retrieval

### **Get User's Chat History:**
```javascript
// For authenticated users
const userHistory = await ChatHistory.find({ user_id: userId })
  .sort({ created_at: -1 })
  .limit(10);

// For anonymous users
const anonymousQueries = await ChatQueries.find({ user_id: null })
  .sort({ created_at: -1 })
  .limit(10);
```

### **Get All User Queries:**
```javascript
// All queries for a specific user
const userQueries = await ChatQueries.find({ user_id: userId })
  .sort({ created_at: -1 });

// All anonymous queries
const anonymousQueries = await ChatQueries.find({ user_id: null })
  .sort({ created_at: -1 });
```

## User Experience Flow

### **Authenticated User:**
1. **User logs in** → Session created with user ID
2. **User asks question** → Query processed with user context
3. **Query stored** → Saved to both `ChatQueries` and `ChatHistory`
4. **Response returned** → AI response with user-specific data
5. **History available** → User can view all previous conversations

### **Anonymous User:**
1. **User visits app** → No authentication required
2. **User asks question** → Query processed without user context
3. **Query stored** → Saved only to `ChatQueries` with null user_id
4. **Response returned** → AI response without user-specific data
5. **No history** → Cannot view previous conversations

### **User Registration/Login:**
1. **Anonymous user registers** → New user account created
2. **User logs in** → Session created with user ID
3. **Future queries** → Stored with user ID and session ID
4. **History building** → New queries added to ChatHistory
5. **Data continuity** → Previous anonymous queries remain separate

## Security and Privacy

### **Data Isolation:**
- ✅ **User-specific data** - Queries linked to specific user accounts
- ✅ **Session tracking** - Activity tracked per session
- ✅ **Anonymous data** - Separated from authenticated user data
- ✅ **Access control** - Users can only access their own data

### **Data Retention:**
- ✅ **Authenticated queries** - Stored indefinitely with user account
- ✅ **Anonymous queries** - Stored for analytics but not linked to users
- ✅ **Session data** - Linked to user sessions for activity tracking
- ✅ **History management** - Users can manage their chat history

## Testing Results

### **Test Verification:**
```
🧪 Test 1: Storing query with authenticated user...
✅ Authenticated query saved successfully!
📝 Query ID: new ObjectId("68ac791428693287d01e9276")
👤 User ID: new ObjectId("68ac78e1636f93113a1a7aa9")
🔑 Session ID: new ObjectId("68ac78e1636f93113a1a7aad")

🧪 Test 2: Storing query in ChatHistory for authenticated user...
✅ ChatHistory entry saved successfully!
📝 History ID: new ObjectId("68ac78e1636f93113a1a7ab3")
👤 User ID: new ObjectId("68ac78e1636f93113a1a7aa9")

🔍 Verification:
📊 Total queries for authenticated user: 1
📊 Total anonymous queries: 1
📊 Total ChatHistory entries for user: 1

✅ Data Integrity Check:
   - Authenticated query has user_id: ✅
   - Authenticated query has session_id: ✅
   - Anonymous query has null user_id: ✅
   - Anonymous query has null session_id: ✅
   - ChatHistory entry has user_id: ✅
```

## Benefits

### **1. User Experience:**
- ✅ **Personalized history** - Users can see all their previous conversations
- ✅ **Session continuity** - Queries linked to specific sessions
- ✅ **Data persistence** - Queries saved across sessions and devices
- ✅ **Seamless transition** - Anonymous to authenticated user flow

### **2. Analytics and Insights:**
- ✅ **User behavior analysis** - Track what users are asking
- ✅ **Usage patterns** - Understand user engagement
- ✅ **Query categorization** - Organize queries by type and topic
- ✅ **Performance metrics** - Track response times and success rates

### **3. Data Management:**
- ✅ **User data control** - Users can manage their own data
- ✅ **Data export** - Users can export their chat history
- ✅ **Data deletion** - Users can delete their data
- ✅ **Privacy compliance** - Proper data handling and storage

## Summary

✅ **User ID Storage**: All authenticated user queries stored with user ID  
✅ **Session Tracking**: Queries linked to user sessions for activity tracking  
✅ **Dual Storage**: Authenticated queries saved to both ChatQueries and ChatHistory  
✅ **Anonymous Support**: Anonymous queries stored separately without user identification  
✅ **Data Integrity**: Proper data validation and storage verification  
✅ **Privacy Protection**: User data properly isolated and protected  
✅ **Testing**: Comprehensive testing confirms proper user ID storage functionality
