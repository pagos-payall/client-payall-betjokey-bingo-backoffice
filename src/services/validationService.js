import Joi from 'joi'
import validator from 'validator'

export class ValidationService {
  // Common validation schemas
  static schemas = {
    user: Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
          'string.alphanum': 'Username must contain only alphanumeric characters',
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username cannot exceed 30 characters',
          'any.required': 'Username is required'
        }),
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),
      level: Joi.string()
        .valid('admin', 'supervisor', 'coordinador', 'operador')
        .required()
        .messages({
          'any.only': 'Level must be one of: admin, supervisor, coordinador, operador',
          'any.required': 'User level is required'
        })
    }),

    room: Joi.object({
      name: Joi.string()
        .min(1)
        .max(100)
        .pattern(/^[a-zA-Z0-9\s\-_]+$/)
        .required()
        .messages({
          'string.min': 'Room name cannot be empty',
          'string.max': 'Room name cannot exceed 100 characters',
          'string.pattern.base': 'Room name contains invalid characters',
          'any.required': 'Room name is required'
        }),
      capacity: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .required()
        .messages({
          'number.min': 'Room capacity must be at least 1',
          'number.max': 'Room capacity cannot exceed 1000',
          'any.required': 'Room capacity is required'
        }),
      status: Joi.string()
        .valid('active', 'disable', 'archive')
        .default('disable'),
      description: Joi.string()
        .max(500)
        .allow('')
        .messages({
          'string.max': 'Description cannot exceed 500 characters'
        })
    }),

    login: Joi.object({
      username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username cannot exceed 30 characters',
          'any.required': 'Username is required'
        }),
      password: Joi.string()
        .min(1)
        .required()
        .messages({
          'string.min': 'Password cannot be empty',
          'any.required': 'Password is required'
        })
    }),

    report: Joi.object({
      startDate: Joi.date()
        .iso()
        .required()
        .messages({
          'date.format': 'Start date must be in ISO format',
          'any.required': 'Start date is required'
        }),
      endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .messages({
          'date.format': 'End date must be in ISO format',
          'date.min': 'End date must be after start date',
          'any.required': 'End date is required'
        }),
      format: Joi.string()
        .valid('xlsx', 'csv')
        .default('xlsx')
        .messages({
          'any.only': 'Format must be either xlsx or csv'
        }),
      filters: Joi.object({
        roomId: Joi.string().allow(''),
        gameType: Joi.string().allow(''),
        status: Joi.string().valid('active', 'completed', 'cancelled').allow('')
      }).default({})
    })
  }

  // Validate data against schema
  static validate(data, schemaName) {
    const schema = this.schemas[schemaName]
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`)
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))
      
      return { 
        isValid: false, 
        errors,
        data: null
      }
    }

    return { 
      isValid: true, 
      errors: [], 
      data: value 
    }
  }

  // Sanitize input data
  static sanitize(data) {
    if (typeof data === 'string') {
      return validator.escape(data.trim())
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }

    if (data && typeof data === 'object') {
      const sanitized = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitize(value)
      }
      return sanitized
    }

    return data
  }

  // Validate and sanitize combined
  static validateAndSanitize(data, schemaName) {
    // First sanitize the data
    const sanitizedData = this.sanitize(data)
    
    // Then validate
    const validation = this.validate(sanitizedData, schemaName)
    
    return validation
  }

  // Custom validators
  static customValidators = {
    isValidRoomCode: (code) => {
      return /^[A-Z0-9]{6}$/.test(code)
    },

    isValidGameId: (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id) // MongoDB ObjectId format
    },

    isValidDateRange: (startDate, endDate) => {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const now = new Date()
      
      return start <= end && start <= now
    },

    isValidFileSize: (size, maxSizeMB = 10) => {
      const maxBytes = maxSizeMB * 1024 * 1024
      return size <= maxBytes
    }
  }

  // Middleware for API routes
  static middleware(schemaName) {
    return (req, res, next) => {
      try {
        let dataToValidate

        // Get data from appropriate source based on method
        switch (req.method) {
          case 'GET':
            dataToValidate = req.query
            break
          case 'POST':
          case 'PUT':
          case 'PATCH':
            dataToValidate = req.body
            break
          default:
            return next()
        }

        const validation = this.validateAndSanitize(dataToValidate, schemaName)

        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
          })
        }

        // Replace original data with validated and sanitized data
        if (req.method === 'GET') {
          req.query = validation.data
        } else {
          req.body = validation.data
        }

        next()
      } catch (error) {
        console.error('Validation middleware error:', error)
        return res.status(500).json({
          success: false,
          message: 'Validation error occurred'
        })
      }
    }
  }
}

export default ValidationService