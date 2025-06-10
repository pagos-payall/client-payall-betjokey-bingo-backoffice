import CryptoJS from 'crypto-js'

class CSRFService {
  constructor() {
    this.secret = process.env.CSRF_SECRET || 'csrf-secret-key'
    this.tokenExpiry = 30 * 60 * 1000 // 30 minutes
  }

  // Generate a CSRF token
  generateToken(sessionId) {
    const timestamp = Date.now()
    const payload = {
      sessionId,
      timestamp,
      nonce: this.generateNonce()
    }

    const token = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      this.secret
    ).toString()

    return token
  }

  // Verify a CSRF token
  verifyToken(token, sessionId) {
    try {
      if (!token || !sessionId) {
        return false
      }

      // Decrypt the token
      const bytes = CryptoJS.AES.decrypt(token, this.secret)
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
      
      if (!decryptedData) {
        return false
      }

      const payload = JSON.parse(decryptedData)

      // Verify session ID
      if (payload.sessionId !== sessionId) {
        return false
      }

      // Check if token has expired
      const now = Date.now()
      if (now - payload.timestamp > this.tokenExpiry) {
        return false
      }

      return true
    } catch (error) {
      console.error('CSRF token verification failed:', error)
      return false
    }
  }

  // Generate a random nonce
  generateNonce() {
    return CryptoJS.lib.WordArray.random(16).toString()
  }

  // Generate session ID from user info
  generateSessionId(userId, userAgent, ipAddress) {
    const sessionData = `${userId}-${userAgent}-${ipAddress}`
    return CryptoJS.SHA256(sessionData).toString()
  }

  // Middleware for Next.js API routes
  middleware() {
    return async (req, res, next) => {
      // Skip CSRF for GET requests
      if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next()
      }

      try {
        const csrfToken = req.headers['x-csrf-token'] || req.body._csrf
        const userAgent = req.headers['user-agent'] || ''
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
        
        // Generate session ID
        const sessionId = this.generateSessionId(
          req.user?.id || 'anonymous',
          userAgent,
          ipAddress
        )

        // Verify CSRF token
        if (!this.verifyToken(csrfToken, sessionId)) {
          return res.status(403).json({
            success: false,
            message: 'CSRF token validation failed'
          })
        }

        next()
      } catch (error) {
        console.error('CSRF middleware error:', error)
        return res.status(500).json({
          success: false,
          message: 'CSRF validation error'
        })
      }
    }
  }

  // Generate CSRF token for client
  async generateClientToken(req) {
    const userAgent = req.headers['user-agent'] || ''
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
    
    const sessionId = this.generateSessionId(
      req.user?.id || 'anonymous',
      userAgent,
      ipAddress
    )

    return this.generateToken(sessionId)
  }
}

export default new CSRFService()