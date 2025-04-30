import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This is a development-only endpoint to create a test user
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      "https://yfdgudnqhlvammrfqlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Check if test user exists
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", "admin@eaglestryke.com")
      .single()

    if (existingUser) {
      return NextResponse.json({ message: "Test user already exists", user: existingUser })
    }

    // Create test user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@eaglestryke.com",
      password: "password123",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin User",
      },
    })

    if (authError) {
      throw authError
    }

    // Update profile role to admin
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", authUser.user.id)
      .select()

    if (profileError) {
      throw profileError
    }

    return NextResponse.json({
      message: "Test user created successfully",
      user: profileData,
    })
  } catch (error: any) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
