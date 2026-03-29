import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js middleware for HTTP Basic Authentication.
 *
 * When AUTH_USERNAME and AUTH_PASSWORD env vars are set:
 * - Requires HTTP Basic Auth on all pages
 * - Returns 401 with WWW-Authenticate header for invalid/missing credentials
 *
 * When env vars are not set (development mode):
 * - Passes through all requests without authentication
 */
export function middleware(request: NextRequest) {
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;

  // Skip auth if credentials aren't configured (development mode)
  if (!username || !password) {
    return NextResponse.next();
  }

  // Check for Authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Wine Cellar"',
      },
    });
  }

  // Decode and verify credentials
  try {
    const base64Credentials = authHeader.slice(6); // Remove 'Basic ' prefix
    const credentials = atob(base64Credentials);
    const colonIndex = credentials.indexOf(':');

    if (colonIndex === -1) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Wine Cellar"',
        },
      });
    }

    const providedUsername = credentials.slice(0, colonIndex);
    const providedPassword = credentials.slice(colonIndex + 1);

    if (providedUsername === username && providedPassword === password) {
      return NextResponse.next();
    }

    // Invalid credentials
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Wine Cellar"',
      },
    });
  } catch {
    // Malformed Base64 or other error
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Wine Cellar"',
      },
    });
  }
}

// Configure which paths the middleware runs on
// Match all paths except static files, _next internals, and public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
