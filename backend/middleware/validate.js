import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Validation for checking if user exists
export const validateCheckExists = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Identifier must be between 3 and 50 characters'),
  handleValidationErrors
];

// Validation for user registration
export const validateRegistration = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('connected_accounts')
    .optional()
    .isArray()
    .withMessage('Connected accounts must be an array'),
  body('connected_accounts.*.platform')
    .optional()
    .isIn(['instagram', 'twitter', 'facebook', 'linkedin', 'github', 'discord', 'telegram'])
    .withMessage('Invalid platform'),
  body('connected_accounts.*.username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Platform username is required'),
  body('connected_accounts.*.profile_url')
    .optional()
    .isURL()
    .withMessage('Invalid profile URL'),
  handleValidationErrors
];

// Validation for user login
export const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Identifier must be between 3 and 50 characters'),
  handleValidationErrors
];

// Validation for profile update
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('connected_accounts')
    .optional()
    .isArray()
    .withMessage('Connected accounts must be an array'),
  body('connected_accounts.*.platform')
    .optional()
    .isIn(['instagram', 'twitter', 'facebook', 'linkedin', 'github', 'discord', 'telegram'])
    .withMessage('Invalid platform'),
  body('connected_accounts.*.username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Platform username is required'),
  body('connected_accounts.*.profile_url')
    .optional()
    .isURL()
    .withMessage('Invalid profile URL'),
  handleValidationErrors
];

// Validation for chat messages
export const validateMessage = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'audio'])
    .withMessage('Invalid message type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  handleValidationErrors
];

// Validation for AI chat query
export const validateAIChatQuery = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Query content is required')
    .isLength({ max: 2000 })
    .withMessage('Query cannot exceed 2000 characters'),
  body('saveToHistory')
    .optional()
    .isBoolean()
    .withMessage('saveToHistory must be a boolean'),
  handleValidationErrors
];

// Validation for chat creation
export const validateChatCreation = [
  body('chatType')
    .isIn(['direct', 'group', 'ai'])
    .withMessage('Invalid chat type'),
  body('participants')
    .optional()
    .isArray()
    .withMessage('Participants must be an array'),
  body('chatName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters'),
  handleValidationErrors
];

// Validation for user search
export const validateUserSearch = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters'),
  handleValidationErrors
];
