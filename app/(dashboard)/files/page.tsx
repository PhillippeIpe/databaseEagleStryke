"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { getAllProfiles, getDocuments, getDocumentUrl } from "@/lib/supabase-utils"
import { FileText, ChevronDown, ChevronUp, Download, Eye, AlertCircle, Search } from "lucide-react"
import type { Document, Profile } from "@/types/supabase"

export default function FilesPage() {
  const { profile } = useAuth()
  const [employees, setEmployees] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [employeeDocuments, setEmployeeDocuments] = useState<Record<string, Document[]>>({})
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")

  const fetchEmployees = async () => {
    try {
      const data = await getAllProfiles()
      // Filter to only show security employees
      const securityEmployees = data.filter((emp) => emp.role === "security_employee")
      setEmployees(securityEmployees)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployeeDocuments = async (employeeId: string) => {
    setLoadingDocuments((prev) => ({ ...prev, [employeeId]: true }))
    try {
      const data = await getDocuments(employeeId)
      setEmployeeDocuments((prev) => ({ ...prev, [employeeId]: data as Document[] }))
    } catch (error) {
      console.error(`Error fetching documents for employee ${employeeId}:`, error)
    } finally {
      setLoadingDocuments((prev) => ({ ...prev, [employeeId]: false }))
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const toggleEmployee = (employeeId: string) => {
    if (expandedEmployee === employeeId) {
      setExpandedEmployee(null)
    } else {
      setExpandedEmployee(employeeId)
      if (!employeeDocuments[employeeId]) {
        fetchEmployeeDocuments(employeeId)
      }
    }
  }

  // Filter employees based on search query
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Check if user has permission to view files
  if (profile?.role !== "admin" && profile?.role !== "personnel") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
        <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Access Denied</h2>
        <p>You do not have permission to view employee files.</p>
      </div>
    )
  }

  const documentTypes: { value: string; label: string }[] = [
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

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find((dt) => dt.value === type)?.label || type
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Employee Files</h1>

      <div className="mb-4 relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Security Employees</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <FileText className="mb-2 h-12 w-12 text-gray-400" />
            <p>No employees found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <div key={employee.id}>
                <div
                  className="flex cursor-pointer items-center justify-between p-6 hover:bg-gray-50"
                  onClick={() => toggleEmployee(employee.id)}
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{employee.full_name || "Unnamed Employee"}</h3>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </div>
                  <div className="flex items-center">
                    {expandedEmployee === employee.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedEmployee === employee.id && (
                  <div className="bg-gray-50 p-6">
                    {loadingDocuments[employee.id] ? (
                      <div className="flex justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
                      </div>
                    ) : !employeeDocuments[employee.id] || employeeDocuments[employee.id].length === 0 ? (
                      <div className="py-4 text-center text-gray-500">No documents uploaded for this employee</div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Document Type
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                File Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Expiration Date
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {employeeDocuments[employee.id].map((document) => (
                              <tr key={document.id}>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {getDocumentTypeLabel(document.document_type)}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div className="text-sm text-gray-500">{document.file_name}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {document.expiration_date
                                      ? new Date(document.expiration_date).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })
                                      : "N/A"}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        try {
                                          const url = await getDocumentUrl(document.file_path)
                                          window.open(url, "_blank")
                                        } catch (error) {
                                          console.error("Error getting document URL:", error)
                                        }
                                      }}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      <Eye className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        try {
                                          const url = await getDocumentUrl(document.file_path)
                                          const a = document.createElement("a")
                                          a.href = url
                                          a.download = document.file_name
                                          document.body.appendChild(a)
                                          a.click()
                                          document.body.removeChild(a)
                                        } catch (error) {
                                          console.error("Error downloading document:", error)
                                        }
                                      }}
                                      className="text-green-600 hover:text-green-900"
                                    >
                                      <Download className="h-5 w-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
