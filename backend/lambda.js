import { app, connectDB } from './app.js';
import serverless from 'serverless-http';

// Connect to MongoDB when Lambda container starts
let isConnected = false;

const connectToDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Lambda handler
export const handler = async (event, context) => {
  // Connect to MongoDB
  await connectToDB();
  
  // Use serverless-http to wrap the Express app
  const serverlessHandler = serverless(app);
  
  // Call the handler
  return await serverlessHandler(event, context);
};

// Health check handler
export const healthHandler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    })
  };
};
