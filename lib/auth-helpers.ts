import { supabase } from "./supabase-client"

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    // Trim email to prevent whitespace issues
    const trimmedEmail = email.trim()

    // Validate inputs
    if (!trimmedEmail || !password) {
      throw new Error("Email and password are required")
    }

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { data: null, error }
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { error }
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session: data.session, error: null }
  } catch (error: any) {
    console.error("Get session error:", error)
    return { session: null, error }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user: data.user, error: null }
  } catch (error: any) {
    console.error("Get user error:", error)
    return { user: null, error }
  }
}
