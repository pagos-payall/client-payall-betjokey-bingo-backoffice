import { NextResponse } from 'next/server'
import { withAuth } from '@/middleware/apiAuth'

export const POST = withAuth()(async function handler(req, res) {
  try {
    // In a real implementation, you would:
    // 1. Add the current refresh token to a blacklist/revocation list
    // 2. Update the database to mark this session as invalid
    // 3. Optionally log the logout event

    // For now, we'll just clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear all authentication cookies
    response.cookies.delete('refresh_token')
    response.cookies.delete('access_token')
    response.cookies.delete('username')
    response.cookies.delete('level')

    return response

  } catch (error) {
    console.error('Logout error:', error)

    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
})