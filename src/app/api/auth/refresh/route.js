import { NextResponse } from 'next/server'
import { AuthService } from '@/services/authService'
import { withAuth } from '@/middleware/apiAuth'

export const POST = withAuth(null, 'read', { skipCSRF: true })(async function handler(request) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Rotate the refresh token
    const { accessToken, refreshToken: newRefreshToken } = 
      await AuthService.rotateRefreshToken(refreshToken)

    // Create response with new tokens
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully'
    })

    // Set both tokens as httpOnly cookies
    const cookieOptions = AuthService.createSecureCookieOptions(
      process.env.NODE_ENV === 'production'
    )

    // Set refresh token (7 days)
    response.cookies.set('refresh_token', newRefreshToken, cookieOptions)
    
    // Set access token (15 minutes) - this was missing!
    response.cookies.set('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 // 15 minutes
    })

    return response

  } catch (error) {
    console.error('Token refresh error:', error)

    // Clear invalid tokens
    const response = NextResponse.json(
      { success: false, message: 'Token refresh failed' },
      { status: 401 }
    )

    response.cookies.delete('refresh_token')
    response.cookies.delete('access_token')

    return response
  }
})