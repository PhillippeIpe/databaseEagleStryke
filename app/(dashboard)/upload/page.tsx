"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { getAllProfiles, getDocuments, uploadDocument, getDocumentUrl } from "@/lib/supabase-utils"
import { Upload, FileText, Check, AlertCircle, Search, RefreshCw } from "lucide-react"
import type { Document, DocumentType, Profile } from "@/types/supabase"

export default function UploadPage() {
  const { user, profile } = useAuth()
  const [securityEmployees, setSecurityEmployees] = useState<Profile[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [selectedType, setSelectedType] = useState<DocumentType>("security_license")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: "security_license", label: "Security License" },
    { value: "list_of_graduates", label: "List of Graduates (Security Training)" },
    { value: "opening_duty_report", label: "Opening Duty Report" },
    { value: "closing_duty_report", label: "Closing Duty Report" },
    { value: "security_training_certificate", label: "Security Training Certificate" },
    { value: "firearm_training_certificate", label: "Firearm Training Certificate" },
    { value: "drug_test_results", label: "Drug Test Results" },
    { value: "neurological_exam_results", label: "Neurological Exam Results" },
    { value: "quit_claim", label: "Quit Claim" },
  ]

  // Fetch all security employees
  const fetchSecurityEmployees = async () => {
    setIsLoadingEmployees(true)
    try {
      const data = await getAllProfiles()
      // Filter to only show security employees or create dummy entries if none exist
      const securityEmployees = data.filter((emp) => emp.role === "security_employee")
      setSecurityEmployees(securityEmployees)
    } catch (error) {
      console.error("Error fetching security employees:", error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  // Fetch documents for a specific employee
  const fetchDocuments = async (employeeId: string) => {
    setIsLoading(true)
    try {
      const data = await getDocuments(employeeId)
      setDocuments(data as Document[])
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSecurityEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      fetchDocuments(selectedEmployee.id)
    } else {
      setDocuments([])
    }
  }, [selectedEmployee])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    if (!selectedEmployee) {
      setError("Please select a security employee")
      setIsSubmitting(false)
      return
    }

    if (!file) {
      setError("Please select a file to upload")
      setIsSubmitting(false)
      return
    }

    try {
      await uploadDocument(selectedEmployee.id, selectedType, file)
      setFile(null)
      setSuccess("Document uploaded successfully")
      fetchDocuments(selectedEmployee.id)
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(`Upload error: ${error.message || "Failed to upload document"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    return documentTypes.find((dt) => dt.value === type)?.label || type
  }

  // Filter security employees based on search query
  const filteredEmployees = securityEmployees.filter(
    (emp) =>
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Check if user has permission to access this page
  if (profile?.role !== "admin" && profile?.role !== "personnel") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
        <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Access Denied</h2>
        <p>You do not have permission to upload documents. Only personnel and administrators can access this page.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Upload Documents</h1>

      {error && (
        <div className="mb-4 flex items-center rounded-md bg-red-50 p-3 text-sm text-red-500">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center rounded-md bg-green-50 p-3 text-sm text-green-500">
          <Check className="mr-2 h-4 w-4" />
          {success}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Select Security Employee</h2>

        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search security employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {isLoadingEmployees ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-4 text-center text-gray-500">
            No security employees found. Please add security employees to the system.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <li
                  key={employee.id}
                  className={`cursor-pointer p-3 hover:bg-gray-50 ${
                    selectedEmployee?.id === employee.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="font-medium text-gray-900">{employee.full_name || "Unnamed Employee"}</div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedEmployee && (
          <div className="mt-4 rounded-md bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-800">
              Selected: {selectedEmployee.full_name || "Unnamed Employee"} ({selectedEmployee.email})
            </p>
          </div>
        )}
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Upload New Document</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="documentType" className="mb-1 block text-sm font-medium text-gray-700">
                Document Type
              </label>
              <select
                id="documentType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!selectedEmployee}
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="file" className="mb-1 block text-sm font-medium text-gray-700">
                File
              </label>
              <div className="flex items-center justify-center rounded-md border border-dashed border-gray-300 p-6">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className={`relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500 ${
                        !selectedEmployee ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={!selectedEmployee}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {file && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FileText className="mr-2 h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !file || !selectedEmployee}
              className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 inline-block h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedEmployee
                ? `Documents for ${selectedEmployee.full_name || "Unnamed Employee"}`
                : "Select an employee to view documents"}
            </h2>
          </div>

          {!selectedEmployee ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <FileText className="mb-2 h-12 w-12 text-gray-400" />
              <p>Please select a security employee to view their documents</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <FileText className="mb-2 h-12 w-12 text-gray-400" />
              <p>No documents uploaded yet for this employee</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((document) => (
                <div key={document.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">
                        {getDocumentTypeLabel(document.document_type as DocumentType)}
                      </h3>
                      <p className="text-sm text-gray-500">{document.file_name}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const url = await getDocumentUrl(document.file_path)
                          window.open(url, "_blank")
                        } catch (error) {
                          console.error("Error getting document URL:", error)
                        }
                      }}
                      className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
