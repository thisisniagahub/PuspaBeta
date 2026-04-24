import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // In development, bypass API key check
  if (process.env.NODE_ENV === 'development') return NextResponse.next()

  // Only protect /api/v1/ routes
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    const apiKey = request.headers.get('x-api-key')
    const secretKey = process.env.API_SECRET_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key diperlukan' }, { status: 401 })
    }
    if (secretKey && apiKey !== secretKey) {
      return NextResponse.json({ success: false, error: 'API key tidak sah' }, { status: 403 })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/v1/:path*',
}
