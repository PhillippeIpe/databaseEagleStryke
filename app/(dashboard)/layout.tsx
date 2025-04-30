"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Shield, FileText, Upload, Calendar, LogOut, Home, Users } from "lucide-react"
import type { Profile } from "@/types/supabase"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    const fetchUserData = async () => {
      try {
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!sessionData.session) {
          console.log("No session found, redirecting to login")
          router.push("/login")
          return
        }

        setUser(sessionData.session.user)

        // Get the user profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .single()

          if (profileError) {
            console.error("Error fetching profile:", profileError)
            // Continue without throwing, we'll handle missing profile below
          } else {
            setProfile(profileData as Profile)
          }
        } catch (profileErr) {
          console.error("Profile fetch error:", profileErr)
          // Continue without profile data
        }
      } catch (err: any) {
        console.error("Error fetching user data:", err)
        setError("Failed to load user data. Please try refreshing the page.")
        // Don't redirect on error, let the user try again
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      fetchUserData()
    }

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        // Refresh the page to get the latest user data
        router.refresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [mounted, router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (err) {
      console.error("Error signing out:", err)
      // Force redirect even if signOut fails
      router.push("/login")
    }
  }

  // Don't render anything on the server to prevent hydration errors
  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <Shield className="mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Error Loading Dashboard</h1>
        <p className="mb-6 text-gray-600">{error}</p>
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Refresh Page
          </button>
          <button onClick={handleSignOut} className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // If we have a user but no profile, create a fallback profile
  const userProfile = profile || {
    id: user?.id || "unknown",
    email: user?.email || "unknown",
    full_name: user?.user_metadata?.full_name || user?.email || "User",
    role: "security_employee", // Default role
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Only personnel and admin can access the dashboard
  if (userProfile?.role === "security_employee") {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <Shield className="mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          Security employees do not have access to this system. Please contact your administrator.
        </p>
        <button onClick={handleSignOut} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Sign Out
        </button>
      </div>
    )
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Upload Files", href: "/upload", icon: Upload },
    { name: "View Files", href: "/files", icon: FileText },
    { name: "Expirations", href: "/expirations", icon: Calendar },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white">
        <div className="flex h-16 items-center px-6">
          <Shield className="mr-2 h-6 w-6" />
          <span className="text-lg font-bold">Eagle Stryke</span>
        </div>
        <nav className="mt-5 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <div className="mb-2 border-t border-gray-700 pt-4">
            <div className="text-sm text-gray-400">Signed in as:</div>
            <div className="font-medium text-white">{userProfile?.full_name || user?.email}</div>
            <div className="text-xs text-gray-400">{userProfile?.role}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 flex-1 bg-gray-100">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
