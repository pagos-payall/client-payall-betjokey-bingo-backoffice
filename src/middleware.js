import { NextResponse } from 'next/server'

export function middleware(request) {
	const refreshToken = request.cookies.get('refresh_token')
	const url = request.nextUrl.clone()

	if (!refreshToken?.value) {
		url.pathname = '/login'
		return NextResponse.redirect(url)
	} else if (refreshToken?.value && url.pathname === '/') {
		url.pathname = '/dashboard/historyLog'
		return NextResponse.redirect(url)
	}
	return NextResponse.next()
}

// Protected routes
export const config = {
	matcher: ['/', '/dashboard/:path*', '/usersManagerView/:path*'],
}
