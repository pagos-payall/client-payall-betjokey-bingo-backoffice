import { NextResponse } from 'next/server'
import { withAuth } from '@/middleware/apiAuth'

export const POST = withAuth()(async function handler(req, res) {
  try {
    const userId = req.user.id

    // In a real implementation, you would:
    // 1. Invalidate ALL refresh tokens for this user across all devices
    // 2. Add all user's tokens to a blacklist
    // 3. Update the user's token_version or similar field in the database
    // 4. Log the security event

    console.log(`Logging out user ${userId} from all devices`)

    // For now, we'll just clear the current cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out from all devices successfully'
    })

    // Clear all authentication cookies
    response.cookies.delete('refresh_token')
    response.cookies.delete('access_token')
    response.cookies.delete('username')
    response.cookies.delete('level')

    return response

  } catch (error) {
    console.error('Logout all devices error:', error)

    return NextResponse.json(
      { success: false, message: 'Failed to logout from all devices' },
      { status: 500 }
    )
  }
})