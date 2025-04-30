import { supabase } from "./supabase-client"
import type { DocumentType } from "@/types/supabase"

// Profile functions
export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) throw error
  return data
}

export async function getAllProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("full_name", { ascending: true })

  if (error) throw error
  return data
}

// Create a security employee (without auth account)
export async function createSecurityEmployee(fullName: string, email: string) {
  // Generate a random UUID for the employee
  const id = crypto.randomUUID()

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id,
      full_name: fullName,
      email,
      role: "security_employee",
    })
    .select()
    .single()

  if (error) throw error

  return data
}

// Announcement functions
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      profiles:created_by (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createAnnouncement(title: string, content: string, userId: string) {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title,
      content,
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Document functions
export async function getDocuments(employeeId?: string) {
  let query = supabase
    .from("documents")
    .select(`
      *,
      profiles:employee_id (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (employeeId) {
    query = query.eq("employee_id", employeeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function uploadDocument(employeeId: string, documentType: DocumentType, file: File) {
  try {
    // Create a unique file path
    const filePath = `${employeeId}/${documentType}/${Date.now()}_${file.name}`

    // Upload file to storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("employee_documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (fileError) {
      console.error("File upload error:", fileError)
      throw fileError
    }

    // Try direct insert first
    const { data, error } = await supabase
      .from("documents")
      .insert({
        employee_id: employeeId,
        document_type: documentType,
        file_path: filePath,
        file_name: file.name,
      })
      .select()
      .single()

    if (error) {
      console.error("Document insert error:", error)

      // If direct insert fails, try the API endpoint
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          documentType,
          filePath,
          fileName: file.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create document record")
      }

      const result = await response.json()
      return result.document
    }

    return data
  } catch (error) {
    console.error("Upload document error:", error)
    throw error
  }
}

export async function getDocumentUrl(filePath: string) {
  const { data, error } = await supabase.storage.from("employee_documents").createSignedUrl(filePath, 60) // 60 seconds expiry

  if (error) throw error
  return data.signedUrl
}

// Expirations functions - Updated to match exact column names
export async function getExpirations() {
  try {
    console.log("Attempting to query expiration table...")
    const { data, error } = await supabase.from("expiration").select("*")

    if (error) {
      console.error("Error fetching expirations:", error)
      throw error
    }

    console.log("Expirations data:", data)
    return data || []
  } catch (error) {
    console.error("getExpirations error:", error)
    throw error
  }
}

export async function updateExpiration(id: string, updates: any) {
  try {
    console.log("Updating expiration with ID:", id)
    console.log("Updates:", updates)

    // Ensure all empty strings are converted to null
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [key, value === "" ? null : value]),
    )

    const { data, error } = await supabase.from("expiration").update(cleanedUpdates).eq("id", id).select().single()

    if (error) {
      console.error("Update expiration error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("updateExpiration error:", error)
    throw error
  }
}
