"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"

export default function DebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session
        const { data: session, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        setSessionData(session)

        // Get profile if session exists
        if (session.session) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.session.user.id)
            .single()

          if (profileError) throw profileError
          setProfileData(profile)
        }
      } catch (err: any) {
        console.error("Debug error:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const goToDashboard = () => {
    window.location.href = "/dashboard"
  }

  if (isLoading) {
    return <div className="p-8">Loading authentication data...</div>
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Authentication Debug Page</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6 rounded-md bg-gray-50 p-4">
        <h2 className="mb-2 text-xl font-semibold">Authentication Status</h2>
        <p className="mb-2">
          <strong>Authenticated:</strong> {sessionData?.session ? "Yes" : "No"}
        </p>
        {sessionData?.session && (
          <>
            <p className="mb-2">
              <strong>User ID:</strong> {sessionData.session.user.id}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {sessionData.session.user.email}
            </p>
          </>
        )}
      </div>

      {profileData && (
        <div className="mb-6 rounded-md bg-blue-50 p-4">
          <h2 className="mb-2 text-xl font-semibold">User Profile</h2>
          <p className="mb-2">
            <strong>Full Name:</strong> {profileData.full_name || "Not set"}
          </p>
          <p className="mb-2">
            <strong>Role:</strong> {profileData.role}
          </p>
        </div>
      )}

      <div className="flex space-x-4">
        {sessionData?.session ? (
          <>
            <button onClick={goToDashboard} className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Go to Dashboard
            </button>
            <button onClick={handleSignOut} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
              Sign Out
            </button>
          </>
        ) : (
          <a href="/login" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Go to Login
          </a>
        )}
      </div>
    </div>
  )
}
