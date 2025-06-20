import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
	process.env.REFRESH_JWT_SECRET || 'your-secret-key'
);

const ROLE_PERMISSIONS = {
	admin: ['dashboard', 'usersManagerView', 'reports'],
	supervisor: ['dashboard', 'reports'],
	coordinador: ['dashboard', 'usersManagerView'],
	operador: ['dashboard'],
};

export async function middleware(request) {
	const refreshToken = request.cookies.get('refresh_token');
	const accessToken = request.cookies.get('access_token');
	const url = request.nextUrl.clone();
	const pathname = url.pathname;

	// If no refresh token, redirect to login
	if (!refreshToken?.value) {
		if (pathname !== '/login' && !pathname.startsWith('/login/')) {
			url.pathname = '/login';
			return NextResponse.redirect(url);
		}
		return NextResponse.next();
	}

	// If has token and on login page, redirect to dashboard
	if (refreshToken?.value && (pathname === '/login' || pathname === '/')) {
		url.pathname = '/dashboard';
		return NextResponse.redirect(url);
	}

	try {
		// Verify the refresh token and get user info
		const { payload } = await jwtVerify(refreshToken.value, JWT_SECRET);
		const userRole = payload.level || payload.role;

		// Check if access token is present and valid
		let accessTokenValid = false;
		let accessTokenExpiry = null;
		if (accessToken?.value) {
			try {
				const ACCESS_SECRET = new TextEncoder().encode(
					process.env.ACCESS_JWT_SECRET || 'your-secret-key'
				);
				const { payload: accessPayload } = await jwtVerify(accessToken.value, ACCESS_SECRET);
				accessTokenValid = true;
				// Get expiry time in milliseconds
				accessTokenExpiry = (accessPayload.exp || 0) * 1000;
			} catch (accessError) {
				console.log('🔑 Access token expired, triggering modal');
				accessTokenValid = false;
			}
		}

		// If access token is missing or expired, set expired status
		if (!accessTokenValid) {
			const response = NextResponse.next();
			response.headers.set('x-token-status', 'expired');
			response.headers.set('x-user-id', payload.sub || payload.userId || '');
			response.headers.set('x-user-role', userRole || '');
			response.headers.set('x-username', payload.username || '');
			response.headers.set('x-token-expiry', '0');
			return response;
		}

		// Check role-based access
		const hasAccess = checkRoleAccess(userRole, pathname);

		if (!hasAccess) {
			// Redirect to dashboard with access denied
			url.pathname = '/dashboard';
			url.searchParams.set('error', 'access_denied');
			return NextResponse.redirect(url);
		}

		// Add user info to headers for API routes
		const response = NextResponse.next();
		response.headers.set('x-token-status', 'active');
		response.headers.set('x-user-id', payload.sub || payload.userId || '');
		response.headers.set('x-user-role', userRole || '');
		response.headers.set('x-username', payload.username || '');
		response.headers.set('x-token-expiry', accessTokenExpiry ? accessTokenExpiry.toString() : '0');

		return response;
	} catch (error) {
		// Invalid refresh token, redirect to login
		console.error('Refresh token verification failed:', error);
		url.pathname = '/login';
		url.searchParams.set('error', 'invalid_token');
		return NextResponse.redirect(url);
	}
}

function checkRoleAccess(userRole, pathname) {
	if (!userRole || !ROLE_PERMISSIONS[userRole]) {
		return false;
	}

	const allowedPaths = ROLE_PERMISSIONS[userRole];

	// Check if the pathname starts with any allowed path
	return allowedPaths.some((path) => pathname.startsWith(`/${path}`));
}

// Protected routes
export const config = {
	matcher: [
		'/',
		'/dashboard/:path*',
		'/usersManagerView/:path*',
		'/reports/:path*',
		'/api/:path*',
	],
};
