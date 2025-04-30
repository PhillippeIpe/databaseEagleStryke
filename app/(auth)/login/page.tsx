"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, AlertCircle, Info } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if we're already logged in
  useEffect(() => {
    if (!mounted) return

    const checkSession = async () => {
      try {
        setDebugInfo("Checking session...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session check error:", error)
          setDebugInfo(`Session check error: ${error.message}`)
          return
        }

        if (data.session) {
          setDebugInfo("User already logged in, redirecting...")
          // Use a timeout to ensure the debug message is displayed
          setTimeout(() => {
            router.push("/dashboard")
          }, 500)
        } else {
          setDebugInfo("No active session found. Please log in.")
        }
      } catch (e: any) {
        console.error("Session check exception:", e)
        setError(`Connection error: ${e.message || "Unknown error"}`)
      }
    }

    checkSession()
  }, [mounted, router])

  // Direct login with test account
  const handleTestLogin = async () => {
    setIsLoading(true)
    setError(null)
    setDebugInfo("Attempting to sign in with test account...")

    try {
      // Use hardcoded test credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@eaglestryke.com",
        password: "password123",
      })

      if (error) {
        console.error("Test login error:", error)
        setDebugInfo(`Test login error: ${error.message}`)
        setError(`Authentication failed: ${error.message}`)
        return
      }

      if (!data || !data.session) {
        setError("No session returned from authentication")
        return
      }

      setDebugInfo("Test login successful, redirecting...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (e: any) {
      console.error("Test login exception:", e)
      setError(`Login error: ${e.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)
    setIsLoading(true)

    try {
      setDebugInfo("Attempting to sign in...")

      // Direct authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Auth error:", error)
        setDebugInfo(`Auth error: ${error.message}`)
        setError(`Authentication failed: ${error.message}`)
        return
      }

      if (!data || !data.session) {
        setError("No session returned from authentication")
        return
      }

      setDebugInfo("Sign in successful, redirecting...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (e: any) {
      console.error("Login exception:", e)
      setError(`Login error: ${e.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Try magic link authentication instead
  const handleMagicLinkLogin = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError(null)
    setDebugInfo("Sending magic link...")

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Magic link error:", error)
        setDebugInfo(`Magic link error: ${error.message}`)
        setError(`Failed to send magic link: ${error.message}`)
        return
      }

      setDebugInfo("Magic link sent! Please check your email.")
    } catch (e: any) {
      console.error("Magic link exception:", e)
      setError(`Error: ${e.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null // Prevent hydration errors
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex items-center justify-center">
          <Shield className="mr-2 h-8 w-8 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">Eagle Stryke Security</h1>
        </div>
        <h2 className="mb-6 text-center text-xl font-semibold text-gray-700">Sign in to your account</h2>

        {error && (
          <div className="mb-4 flex items-center rounded-md bg-red-50 p-3 text-sm text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="mb-4 flex items-center rounded-md bg-blue-50 p-3 text-sm text-blue-500">
            <Info className="mr-2 h-4 w-4" />
            {debugInfo}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in with Password"}
            </button>

            <button
              type="button"
              onClick={handleMagicLinkLogin}
              disabled={isLoading}
              className="w-full rounded-md bg-green-600 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Sign in with Magic Link"}
            </button>

            <button
              type="button"
              onClick={handleTestLogin}
              disabled={isLoading}
              className="w-full rounded-md bg-gray-200 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in with Test Account"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register
          </Link>
        </div>

        {/* Add test credentials for reference */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">Test account: admin@eaglestryke.com / password123</p>
        </div>
      </div>
    </div>
  )
}
