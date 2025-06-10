import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ACCESS_JWT_SECRET || 'your-secret-key'
)

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_JWT_SECRET || 'your-refresh-secret-key'
)

export const ROLE_PERMISSIONS = {
  admin: {
    paths: ['dashboard', 'usersManagerView', 'reports'],
    actions: ['create', 'read', 'update', 'delete', 'archive']
  },
  supervisor: {
    paths: ['dashboard', 'reports'],
    actions: ['create', 'read', 'update']
  },
  coordinador: {
    paths: ['dashboard', 'usersManagerView'],
    actions: ['create', 'read', 'update']
  },
  operador: {
    paths: ['dashboard'],
    actions: ['read']
  }
}

export class AuthService {
  static async verifyAccessToken(token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  static async verifyRefreshToken(token) {
    try {
      const { payload } = await jwtVerify(token, REFRESH_SECRET)
      return payload
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  static async generateTokens(userPayload) {
    const accessToken = await new SignJWT(userPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET)

    const refreshToken = await new SignJWT(userPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(REFRESH_SECRET)

    return { accessToken, refreshToken }
  }

  static checkRolePermission(userRole, requiredPath, action = 'read') {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
      return false
    }

    const roleConfig = ROLE_PERMISSIONS[userRole]
    
    // Check path permission
    const hasPathAccess = roleConfig.paths.some(path => 
      requiredPath.startsWith(`/${path}`) || requiredPath.startsWith(path)
    )

    // Check action permission
    const hasActionAccess = roleConfig.actions.includes(action)

    return hasPathAccess && hasActionAccess
  }

  static validateUserRole(userRole, targetPath, operation) {
    // Admin can access everything
    if (userRole === 'admin') {
      return true
    }

    // Specific validations for each role
    switch (userRole) {
      case 'supervisor':
        return targetPath.includes('reports') || targetPath.includes('dashboard')
      
      case 'coordinador':
        return targetPath.includes('usersManagerView') || targetPath.includes('dashboard')
      
      case 'operador':
        return targetPath.includes('dashboard') && operation === 'read'
      
      default:
        return false
    }
  }

  static createSecureCookieOptions(isProduction = false) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    }
  }

  static async rotateRefreshToken(oldRefreshToken) {
    try {
      const payload = await this.verifyRefreshToken(oldRefreshToken)
      
      // Generate new tokens
      const { accessToken, refreshToken } = await this.generateTokens({
        sub: payload.sub,
        username: payload.username,
        level: payload.level,
        userId: payload.userId
      })

      return { accessToken, refreshToken }
    } catch (error) {
      throw new Error('Token rotation failed')
    }
  }

  static sanitizeUserPayload(user) {
    return {
      sub: user.id || user._id,
      username: user.username,
      level: user.level || user.role,
      userId: user.id || user._id,
      iat: Math.floor(Date.now() / 1000)
    }
  }
}

export default AuthService