import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return res
  }

  try {
    // Create supabase middleware client with hardcoded values
    const supabase = createMiddlewareClient(
      { req, res },
      {
        supabaseUrl: "https://yfdgudnqhlvammrfqlgo.supabase.co",
        supabaseKey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZGd1ZG5xaGx2YW1tcmZxbGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Nzc3MTQsImV4cCI6MjA2MTU1MzcxNH0.86zZyqncAdSTinpbYKk50isDyqdGXfFsMH4-OhY160c",
      },
    )

    // Refresh session if expired
    await supabase.auth.getSession()

    // Auth condition - paths that don't require authentication
    const publicPaths = ["/login", "/register", "/auth/callback"]
    const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not authenticated and trying to access a protected route
    if (!session && !isPublicPath) {
      console.log("Middleware: No session, redirecting to login")
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access login/register
    if (session && isPublicPath && pathname !== "/auth/callback") {
      console.log("Middleware: Has session, redirecting to dashboard")
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Error in middleware:", error)
    // Continue without redirection on error
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
