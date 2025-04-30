import { supabase } from "./supabase-client"

// This function will check and fix RLS policies
export async function checkAndFixRLSPolicies() {
  try {
    // Only run this in development
    if (process.env.NODE_ENV !== "development") {
      console.log("RLS policy fixes only run in development mode")
      return { success: false, message: "Not in development mode" }
    }

    // We need admin privileges for this
    const supabaseAdmin = supabase // In a real app, you'd use a service role client

    // Check if we have the necessary permissions
    const { data: permCheck, error: permError } = await supabaseAdmin.rpc("is_admin_or_personnel")

    if (permError || !permCheck) {
      console.error("Permission check failed:", permError)
      return { success: false, message: "Insufficient permissions" }
    }

    // Fix documents table RLS policy
    const { error: docError } = await supabaseAdmin.rpc("fix_documents_rls")

    if (docError) {
      console.error("Error fixing documents RLS:", docError)
      return { success: false, message: "Failed to fix documents RLS" }
    }

    // Fix expiration table RLS policy
    const { error: expError } = await supabaseAdmin.rpc("fix_expiration_rls")

    if (expError) {
      console.error("Error fixing expiration RLS:", expError)
      return { success: false, message: "Failed to fix expiration RLS" }
    }

    return { success: true, message: "RLS policies fixed successfully" }
  } catch (error) {
    console.error("Error checking/fixing RLS policies:", error)
    return { success: false, message: "Error checking/fixing RLS policies" }
  }
}
