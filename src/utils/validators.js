const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters'
    })
});

// User login validation
const loginSchema = Joi.object({
  emailOrUsername: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or username is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Message validation
const messageSchema = Joi.object({
  receiverId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Receiver ID must be a number',
      'number.positive': 'Receiver ID must be positive',
      'any.required': 'Receiver ID is required'
    }),
  type: Joi.string()
    .valid('text', 'image')
    .required()
    .messages({
      'any.only': 'Message type must be either text or image',
      'any.required': 'Message type is required'
    }),
  text: Joi.string()
    .max(10000)
    .when('type', {
      is: 'text',
      then: Joi.required(),
      otherwise: Joi.optional().allow('')
    })
    .messages({
      'string.max': 'Message text cannot exceed 10,000 characters',
      'any.required': 'Message text is required for text messages'
    }),
  imageBase64: Joi.string()
    .when('type', {
      is: 'image',
      then: Joi.required(),
      otherwise: Joi.optional().allow('')
    })
    .messages({
      'any.required': 'Image data is required for image messages'
    })
});

// Edit message validation
const editMessageSchema = Joi.object({
  text: Joi.string()
    .max(10000)
    .optional()
    .messages({
      'string.max': 'Message text cannot exceed 10,000 characters'
    }),
  imageBase64: Joi.string()
    .optional()
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Reset password validation
const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters'
    })
});

// Search users validation
const searchUsersSchema = Joi.object({
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Search term must be at least 1 character',
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(20)
    .optional()
});

// Get messages validation
const getMessagesSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    }),
  cursor: Joi.date()
    .optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .optional()
});

// Update profile validation
const updateProfileSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .optional(),
  bio: Joi.string()
    .max(255)
    .optional()
    .allow(''),
  profilePicture: Joi.string()
    .optional()
    .allow('')
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Replace query with validated values
    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  registerSchema,
  loginSchema,
  messageSchema,
  editMessageSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  searchUsersSchema,
  getMessagesSchema,
  updateProfileSchema
};