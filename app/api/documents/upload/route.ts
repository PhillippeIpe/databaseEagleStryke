import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yfdgudnqhlvammrfqlgo.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function POST(request: Request) {
  try {
    const { employeeId, documentType, filePath, fileName } = await request.json()

    // Validate required fields
    if (!employeeId || !documentType || !filePath || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields: employeeId, documentType, filePath, fileName" },
        { status: 400 },
      )
    }

    // Insert document record using admin privileges (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        employee_id: employeeId,
        document_type: documentType,
        file_path: filePath,
        file_name: fileName,
      })
      .select()
      .single()

    if (error) {
      console.error("Admin document insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, document: data })
  } catch (error: any) {
    console.error("Document upload API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
