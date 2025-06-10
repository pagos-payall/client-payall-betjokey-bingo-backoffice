import { NextResponse } from 'next/server'
import { withAuth } from '@/middleware/apiAuth'
import csrfService from '@/services/csrfService'

export const GET = withAuth(null, 'read', { skipCSRF: true })(async function handler(req, res) {
  try {
    // Generate CSRF token for the current session
    const csrfToken = await csrfService.generateClientToken(req)

    return NextResponse.json({
      success: true,
      csrfToken
    })

  } catch (error) {
    console.error('CSRF token generation error:', error)

    return NextResponse.json(
      { success: false, message: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
})