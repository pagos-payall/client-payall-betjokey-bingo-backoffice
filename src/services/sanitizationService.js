import DOMPurify from 'isomorphic-dompurify'

export class SanitizationService {
  // Default configuration for DOMPurify
  static defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  }

  // Strict configuration for user inputs
  static strictConfig = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  }

  // Configuration for rich text (if needed in the future)
  static richTextConfig = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'br', 'p', 'div', 'span',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    ALLOWED_ATTR: ['class', 'style'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  }

  /**
   * Sanitize HTML content with default configuration
   * @param {string} dirty - The potentially dangerous HTML string
   * @param {object} config - Optional custom configuration
   * @returns {string} - Sanitized HTML string
   */
  static sanitizeHTML(dirty, config = this.defaultConfig) {
    if (typeof dirty !== 'string') {
      return ''
    }

    return DOMPurify.sanitize(dirty, config)
  }

  /**
   * Strictly sanitize input by stripping all HTML
   * @param {string} dirty - The potentially dangerous string
   * @returns {string} - Plain text string
   */
  static sanitizeStrict(dirty) {
    if (typeof dirty !== 'string') {
      return ''
    }

    return DOMPurify.sanitize(dirty, this.strictConfig)
  }

  /**
   * Sanitize rich text content (for future use)
   * @param {string} dirty - The potentially dangerous HTML string
   * @returns {string} - Sanitized HTML string with allowed rich text tags
   */
  static sanitizeRichText(dirty) {
    if (typeof dirty !== 'string') {
      return ''
    }

    return DOMPurify.sanitize(dirty, this.richTextConfig)
  }

  /**
   * Sanitize object properties recursively
   * @param {object} obj - Object with potentially dangerous values
   * @param {boolean} strict - Whether to use strict sanitization
   * @returns {object} - Object with sanitized values
   */
  static sanitizeObject(obj, strict = true) {
    if (!obj || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, strict))
    }

    const sanitized = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = strict ? this.sanitizeStrict(value) : this.sanitizeHTML(value)
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value, strict)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Sanitize form data
   * @param {FormData|object} formData - Form data to sanitize
   * @returns {object} - Sanitized form data
   */
  static sanitizeFormData(formData) {
    let data = formData

    // Convert FormData to regular object if needed
    if (formData instanceof FormData) {
      data = {}
      for (const [key, value] of formData.entries()) {
        data[key] = value
      }
    }

    return this.sanitizeObject(data, true)
  }

  /**
   * Sanitize URL parameters
   * @param {URLSearchParams|object} params - URL parameters to sanitize
   * @returns {object} - Sanitized parameters
   */
  static sanitizeURLParams(params) {
    let data = params

    // Convert URLSearchParams to regular object if needed
    if (params instanceof URLSearchParams) {
      data = {}
      for (const [key, value] of params.entries()) {
        data[key] = value
      }
    }

    return this.sanitizeObject(data, true)
  }

  /**
   * Validate and sanitize email addresses
   * @param {string} email - Email address to sanitize
   * @returns {string} - Sanitized email or empty string if invalid
   */
  static sanitizeEmail(email) {
    if (typeof email !== 'string') {
      return ''
    }

    const sanitized = this.sanitizeStrict(email).toLowerCase().trim()
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    return emailRegex.test(sanitized) ? sanitized : ''
  }

  /**
   * Sanitize username (alphanumeric + underscores only)
   * @param {string} username - Username to sanitize
   * @returns {string} - Sanitized username
   */
  static sanitizeUsername(username) {
    if (typeof username !== 'string') {
      return ''
    }

    return this.sanitizeStrict(username)
      .replace(/[^a-zA-Z0-9_]/g, '')
      .trim()
  }

  /**
   * Sanitize room name (alphanumeric + spaces + common punctuation)
   * @param {string} roomName - Room name to sanitize
   * @returns {string} - Sanitized room name
   */
  static sanitizeRoomName(roomName) {
    if (typeof roomName !== 'string') {
      return ''
    }

    return this.sanitizeStrict(roomName)
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .trim()
  }

  /**
   * Create a hook for React components
   * @param {boolean} strict - Whether to use strict sanitization
   * @returns {function} - Hook function
   */
  static createSanitizeHook(strict = true) {
    return function useSanitize() {
      const sanitize = (input) => {
        if (typeof input === 'string') {
          return strict ? 
            SanitizationService.sanitizeStrict(input) : 
            SanitizationService.sanitizeHTML(input)
        }
        
        if (typeof input === 'object') {
          return SanitizationService.sanitizeObject(input, strict)
        }
        
        return input
      }

      return { sanitize }
    }
  }

  /**
   * Express middleware for sanitizing request data
   * @param {boolean} strict - Whether to use strict sanitization
   * @returns {function} - Express middleware function
   */
  static middleware(strict = true) {
    return (req, res, next) => {
      try {
        // Sanitize body
        if (req.body && typeof req.body === 'object') {
          req.body = this.sanitizeObject(req.body, strict)
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
          req.query = this.sanitizeObject(req.query, strict)
        }

        // Sanitize route parameters
        if (req.params && typeof req.params === 'object') {
          req.params = this.sanitizeObject(req.params, strict)
        }

        next()
      } catch (error) {
        console.error('Sanitization middleware error:', error)
        return res.status(500).json({
          success: false,
          message: 'Input sanitization failed'
        })
      }
    }
  }
}

// Create hooks for React components
export const useSanitize = SanitizationService.createSanitizeHook(true)
export const useSanitizeHTML = SanitizationService.createSanitizeHook(false)

export default SanitizationService