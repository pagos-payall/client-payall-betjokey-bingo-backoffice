import { NextResponse } from 'next/server'
import { withAuth, validateOperation } from '@/middleware/apiAuth'
import { ValidationService } from '@/services/validationService'
import { SanitizationService } from '@/services/sanitizationService'

// Example: Create user endpoint with full validation and sanitization
export const POST = withAuth('admin', 'create')(async function handler(req, res) {
  try {
    // The request body is already sanitized by the middleware
    // Now validate the data structure
    const validation = ValidationService.validateAndSanitize(req.body, 'user')

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    const userData = validation.data

    // Additional custom validations if needed
    if (userData.username && userData.username.length < 3) {
      return NextResponse.json({
        success: false,
        message: 'Username must be at least 3 characters long'
      }, { status: 400 })
    }

    // Here you would typically:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Save to database
    // 4. Return success response

    console.log('Creating user with validated data:', userData)

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        username: userData.username,
        email: userData.email,
        level: userData.level
        // Never return password even if hashed
      }
    })

  } catch (error) {
    console.error('User creation error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
})

// Example: Get users with query validation
export const GET = withAuth('admin', 'read')(async function handler(req, res) {
  try {
    // Sanitize and validate query parameters
    const sanitizedQuery = SanitizationService.sanitizeURLParams(req.nextUrl.searchParams)
    
    // Define schema for query parameters
    const querySchema = {
      page: parseInt(sanitizedQuery.page) || 1,
      limit: Math.min(parseInt(sanitizedQuery.limit) || 10, 100), // Max 100 items
      search: sanitizedQuery.search || '',
      level: sanitizedQuery.level || ''
    }

    // Validate query parameters
    const allowedLevels = ['admin', 'supervisor', 'coordinador', 'operador']
    if (querySchema.level && !allowedLevels.includes(querySchema.level)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid level parameter'
      }, { status: 400 })
    }

    // Here you would typically:
    // 1. Query database with parameters
    // 2. Apply pagination
    // 3. Return results

    console.log('Fetching users with parameters:', querySchema)

    return NextResponse.json({
      success: true,
      data: {
        users: [], // Mock empty array
        pagination: {
          page: querySchema.page,
          limit: querySchema.limit,
          total: 0,
          totalPages: 0
        }
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
})