import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Hardcoded credentials for testing
const supabaseUrl = "https://yfdgudnqhlvammrfqlgo.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZGd1ZG5xaGx2YW1tcmZxbGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Nzc3MTQsImV4cCI6MjA2MTU1MzcxNH0.86zZyqncAdSTinpbYKk50isDyqdGXfFsMH4-OhY160c"

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is available
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true })
    return !error
  } catch (e) {
    console.error("Supabase connection check failed:", e)
    return false
  }
}
