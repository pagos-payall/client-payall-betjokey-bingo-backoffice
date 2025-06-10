import { AuthService } from '@/services/authService'
import csrfService from '@/services/csrfService'

export function withAuth(requiredRole = null, requiredAction = 'read', options = {}) {
  const { skipCSRF = false } = options
  
  return function(handler) {
    return async function(req, res) {
      try {
        // Get token from cookies or Authorization header
        const token = req.cookies.refresh_token || 
                     req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'No authentication token provided'
          })
        }

        // Verify token and get user payload
        const userPayload = await AuthService.verifyRefreshToken(token)
        
        // Add user info to request
        req.user = {
          id: userPayload.sub,
          username: userPayload.username,
          level: userPayload.level,
          userId: userPayload.userId
        }

        // CSRF validation for state-changing operations
        if (!skipCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          const csrfToken = req.headers['x-csrf-token']
          const userAgent = req.headers['user-agent'] || ''
          const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || ''
          
          const sessionId = csrfService.generateSessionId(
            req.user.id,
            userAgent,
            ipAddress
          )

          if (!csrfService.verifyToken(csrfToken, sessionId)) {
            return res.status(403).json({
              success: false,
              message: 'CSRF token validation failed'
            })
          }
        }
        
        // Check role permissions if required
        if (requiredRole) {
          const hasPermission = AuthService.checkRolePermission(
            userPayload.level,
            req.url,
            requiredAction
          )

          if (!hasPermission) {
            return res.status(403).json({
              success: false,
              message: 'Insufficient permissions'
            })
          }
        }

        // Call the original handler
        return handler(req, res)

      } catch (error) {
        console.error('Authentication middleware error:', error)
        
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
    }
  }
}

export function withRoleCheck(allowedRoles = []) {
  return function(handler) {
    return async function(req, res) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.level)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        })
      }

      return handler(req, res)
    }
  }
}

export function combineMiddleware(...middlewares) {
  return function(handler) {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    )
  }
}

// Helper to validate specific operations
export function validateOperation(operation, resource) {
  return function(handler) {
    return async function(req, res) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const hasPermission = AuthService.checkRolePermission(
        req.user.level,
        resource,
        operation
      )

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Operation '${operation}' not allowed on '${resource}'`
        })
      }

      return handler(req, res)
    }
  }
}

export default withAuth