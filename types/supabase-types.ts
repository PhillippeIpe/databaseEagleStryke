export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "admin" | "personnel" | "security_employee"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "admin" | "personnel" | "security_employee"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "admin" | "personnel" | "security_employee"
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          employee_id: string
          document_type: DocumentType
          file_path: string
          file_name: string
          expiration_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          document_type: DocumentType
          file_path: string
          file_name: string
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          document_type?: DocumentType
          file_path?: string
          file_name?: string
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      document_expirations: {
        Row: {
          id: string
          employee_id: string
          security_license_expiry: string | null
          security_training_expiry: string | null
          firearm_training_expiry: string | null
          drug_test_expiry: string | null
          neurological_exam_expiry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          security_license_expiry?: string | null
          security_training_expiry?: string | null
          firearm_training_expiry?: string | null
          drug_test_expiry?: string | null
          neurological_exam_expiry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          security_license_expiry?: string | null
          security_training_expiry?: string | null
          firearm_training_expiry?: string | null
          drug_test_expiry?: string | null
          neurological_exam_expiry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_or_personnel: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type DocumentType =
  | "security_license"
  | "list_of_graduates"
  | "opening_duty_report"
  | "closing_duty_report"
  | "security_training_certificate"
  | "firearm_training_certificate"
  | "drug_test_results"
  | "neurological_exam_results"
  | "quit_claim"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"]
export type Document = Database["public"]["Tables"]["documents"]["Row"]
export type DocumentExpiration = Database["public"]["Tables"]["document_expirations"]["Row"]
