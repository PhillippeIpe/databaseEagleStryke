"use client"

import { useAuth } from "@/contexts/auth-context"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const { profile } = useAuth()

  // Check if user has permission to access admin page
  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
        <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Access Denied</h2>
        <p>You do not have permission to access this admin page.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Data Import</h2>
          <p className="mb-4 text-gray-600">Import employee data and expiration dates from CSV files.</p>
          <Link
            href="/admin/import"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Import
          </Link>
        </div>

        {/* Add more admin tools here */}
      </div>
    </div>
  )
}
