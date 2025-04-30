"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { getAllProfiles, createSecurityEmployee, updateProfile } from "@/lib/supabase-utils"
import { UserPlus, Users, Check, AlertCircle, Search, Edit, X } from "lucide-react"
import type { Profile } from "@/types/supabase"

export default function EmployeesPage() {
  const { profile } = useAuth()
  const [employees, setEmployees] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchEmployees = async () => {
    setIsLoading(true)
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

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (editingEmployee) {
        // Update existing employee
        await updateProfile(editingEmployee.id, { full_name: fullName, email })
        setSuccess(`Employee ${fullName} updated successfully`)
      } else {
        // Create new employee
        await createSecurityEmployee(fullName, email)
        setSuccess(`Employee ${fullName} created successfully`)
      }

      setFullName("")
      setEmail("")
      setShowForm(false)
      setEditingEmployee(null)
      fetchEmployees()
    } catch (error: any) {
      setError(error.message || "Failed to save employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (employee: Profile) => {
    setEditingEmployee(employee)
    setFullName(employee.full_name || "")
    setEmail(employee.email)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEmployee(null)
    setFullName("")
    setEmail("")
    setError(null)
  }

  // Filter employees based on search query
  const filteredEmployees = employees.filter(
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
        <p>You do not have permission to manage employees. Only personnel and administrators can access this page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Security Employees</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingEmployee ? "Edit Employee" : "Add New Security Employee"}
            </h2>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

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

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Employee List</h2>
            <div className="relative w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <Users className="mb-2 h-12 w-12 text-gray-400" />
            <p>No security employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.full_name || "Unnamed Employee"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
