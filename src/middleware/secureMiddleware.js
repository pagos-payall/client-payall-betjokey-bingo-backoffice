import { withAuth } from './apiAuth'
import { ValidationService } from '@/services/validationService'
import { SanitizationService } from '@/services/sanitizationService'

/**
 * Comprehensive security middleware that combines:
 * - Authentication & Authorization
 * - CSRF Protection
 * - Input Validation
 * - Input Sanitization
 * - Rate Limiting (can be added)
 */
export function withSecurity(options = {}) {
  const {
    requiredRole = null,
    requiredAction = 'read',
    validationSchema = null,
    skipCSRF = false,
    strictSanitization = true,
    customValidation = null
  } = options

  return function(handler) {
    // First apply authentication and CSRF protection
    const authHandler = withAuth(requiredRole, requiredAction, { skipCSRF })(
      async function securedHandler(req, res) {
        try {
          // Step 1: Sanitize all inputs
          if (req.body && typeof req.body === 'object') {
            req.body = SanitizationService.sanitizeObject(req.body, strictSanitization)
          }

          if (req.query && typeof req.query === 'object') {
            req.query = SanitizationService.sanitizeObject(req.query, strictSanitization)
          }

          // Step 2: Validate input schema if provided
          if (validationSchema) {
            let dataToValidate = req.body

            // For GET requests, validate query parameters
            if (req.method === 'GET') {
              dataToValidate = req.query
            }

            const validation = ValidationService.validate(dataToValidate, validationSchema)

            if (!validation.isValid) {
              return res.status(400).json({
                success: false,
                message: 'Input validation failed',
                errors: validation.errors
              })
            }

            // Replace with validated data
            if (req.method === 'GET') {
              req.query = validation.data
            } else {
              req.body = validation.data
            }
          }

          // Step 3: Custom validation if provided
          if (customValidation && typeof customValidation === 'function') {
            const customValidationResult = await customValidation(req)
            
            if (!customValidationResult.isValid) {
              return res.status(400).json({
                success: false,
                message: customValidationResult.message || 'Custom validation failed',
                errors: customValidationResult.errors || []
              })
            }
          }

          // Step 4: Add security headers to response
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('X-Frame-Options', 'DENY')
          res.setHeader('X-XSS-Protection', '1; mode=block')
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

          // Step 5: Call the original handler
          return handler(req, res)

        } catch (error) {
          console.error('Security middleware error:', error)
          
          return res.status(500).json({
            success: false,
            message: 'Security validation failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          })
        }
      }
    )

    return authHandler
  }
}

/**
 * Preset configurations for common use cases
 */
export const securityPresets = {
  // For admin-only operations
  adminOnly: (validationSchema = null) => withSecurity({
    requiredRole: 'admin',
    requiredAction: 'delete',
    validationSchema,
    strictSanitization: true
  }),

  // For supervisor and admin operations
  supervisorAndUp: (validationSchema = null) => withSecurity({
    requiredRole: 'supervisor',
    requiredAction: 'update',
    validationSchema,
    strictSanitization: true
  }),

  // For read-only operations
  readOnly: (validationSchema = null) => withSecurity({
    requiredAction: 'read',
    validationSchema,
    strictSanitization: true
  }),

  // For public endpoints (still with sanitization)
  public: (validationSchema = null) => withSecurity({
    requiredRole: null,
    validationSchema,
    skipCSRF: true,
    strictSanitization: true
  }),

  // For user creation/update
  userManagement: () => withSecurity({
    requiredRole: 'admin',
    requiredAction: 'create',
    validationSchema: 'user',
    strictSanitization: true,
    customValidation: async (req) => {
      // Custom validation for user operations
      if (req.method === 'POST' && req.body.username) {
        // Check if username contains only allowed characters
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(req.body.username)) {
          return {
            isValid: false,
            message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
          }
        }
      }

      return { isValid: true }
    }
  }),

  // For room management
  roomManagement: () => withSecurity({
    requiredRole: 'coordinador',
    requiredAction: 'update',
    validationSchema: 'room',
    strictSanitization: true,
    customValidation: async (req) => {
      // Custom validation for room operations
      if (req.body.capacity && req.body.capacity > 1000) {
        return {
          isValid: false,
          message: 'Room capacity cannot exceed 1000'
        }
      }

      return { isValid: true }
    }
  }),

  // For report generation
  reportGeneration: () => withSecurity({
    requiredRole: 'supervisor',
    requiredAction: 'read',
    validationSchema: 'report',
    strictSanitization: true,
    customValidation: async (req) => {
      // Validate date range for reports
      if (req.body.startDate && req.body.endDate) {
        const start = new Date(req.body.startDate)
        const end = new Date(req.body.endDate)
        const now = new Date()

        if (start > end) {
          return {
            isValid: false,
            message: 'Start date must be before end date'
          }
        }

        if (start > now) {
          return {
            isValid: false,
            message: 'Start date cannot be in the future'
          }
        }

        // Limit report range to 1 year
        const oneYear = 365 * 24 * 60 * 60 * 1000
        if (end - start > oneYear) {
          return {
            isValid: false,
            message: 'Date range cannot exceed one year'
          }
        }
      }

      return { isValid: true }
    }
  })
}

export default withSecurity