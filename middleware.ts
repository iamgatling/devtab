import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // For Firebase auth, we'll use a client-side approach
  // This middleware only redirects unauthenticated users away from protected routes
  // The actual auth check happens client-side in the layout

  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is protected
  const isProtectedPath = !path.includes("/login") && !path.includes("/signup")

  // For demonstration, we'll just use a cookie to check if the user is authenticated
  // In a real app, this would be handled by Firebase auth
  const authCookie = request.cookies.get("auth")
  const isAuthenticated = authCookie?.value === "true"

  // If the path is protected and the user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - login, signup (auth pages)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|login|signup).*)",
  ],
}
