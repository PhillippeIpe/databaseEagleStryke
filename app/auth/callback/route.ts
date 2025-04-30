import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(`${origin}/dashboard`)
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code_provided`)
}
