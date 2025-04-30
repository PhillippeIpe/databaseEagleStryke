import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

// This is a development-only endpoint to fix RLS policies
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }

  try {
    // Execute SQL to fix RLS policies
    const { error: docsError } = await supabase.rpc("execute_sql", {
      sql_string: `
        -- Drop existing policies for documents table
        DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
        
        -- Create new policy that allows personnel and admins to insert documents for any employee
        CREATE POLICY "Personnel and admins can insert documents" 
          ON documents FOR INSERT 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role IN ('personnel', 'admin')
            )
          );
      `,
    })

    if (docsError) {
      console.error("Error fixing documents RLS:", docsError)
      return NextResponse.json({ error: docsError.message }, { status: 500 })
    }

    // Fix expiration table policies
    const { error: expError } = await supabase.rpc("execute_sql", {
      sql_string: `
        -- Ensure public access to expiration table for authenticated users
        ALTER TABLE IF EXISTS public.expiration ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Personnel and admins can view all expirations" ON public.expiration;
        DROP POLICY IF EXISTS "Personnel and admins can update expirations" ON public.expiration;
        DROP POLICY IF EXISTS "Personnel and admins can insert expirations" ON public.expiration;
        
        -- Create new policies
        CREATE POLICY "Personnel and admins can view all expirations" 
          ON public.expiration FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role IN ('personnel', 'admin')
            )
          );
        
        CREATE POLICY "Personnel and admins can update expirations" 
          ON public.expiration FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role IN ('personnel', 'admin')
            )
          );
        
        CREATE POLICY "Personnel and admins can insert expirations" 
          ON public.expiration FOR INSERT 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role IN ('personnel', 'admin')
            )
          );
      `,
    })

    if (expError) {
      console.error("Error fixing expiration RLS:", expError)
      return NextResponse.json({ error: expError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "RLS policies fixed successfully",
    })
  } catch (error: any) {
    console.error("Error fixing RLS policies:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
