export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "personnel" | "security_employee"
  created_at: string
  updated_at: string
}

export type Announcement = {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
  updated_at: string
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

export type Document = {
  id: string
  employee_id: string
  document_type: DocumentType
  file_path: string
  file_name: string
  expiration_date: string | null
  created_at: string
  updated_at: string
}

export type DocumentExpiration = {
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
