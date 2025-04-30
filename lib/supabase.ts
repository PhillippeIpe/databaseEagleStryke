import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase-types"

// Ensure we have a valid URL by checking format
function getValidSupabaseUrl() {
  // First try environment variable
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Fallback URL if environment variable is not available
  const fallbackUrl = "https://yfdgudnqhlvammrfqlgo.supabase.co"

  // Use the environment variable if it exists and is properly formatted
  const url = envUrl || fallbackUrl

  // Ensure URL starts with https:// or http://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }

  return url
}

// Get valid Supabase URL
const supabaseUrl = getValidSupabaseUrl()

// Get Supabase anon key with fallback
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZGd1ZG5xaGx2YW1tcmZxbGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Nzc3MTQsImV4cCI6MjA2MTU1MzcxNH0.86zZyqncAdSTinpbYKk50isDyqdGXfFsMH4-OhY160c"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper function to get user session
export async function getUserSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting user session:", error)
    return null
  }
}
