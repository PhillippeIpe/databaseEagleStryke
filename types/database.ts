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
          document_type: string
          file_path: string
          file_name: string
          expiration_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          document_type: string
          file_path: string
          file_name: string
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          document_type?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
