"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { Calendar, AlertCircle, Check, Search, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

type Expiration = {
  id: string
  "FULL NAME": string
  NPC: string | null
  NBI: string | null
  MEDICAL: string | null
  ORIENTATION: string | null
  "License Expiration": string | null
  created_at: string
  updated_at: string
}

export default function ExpirationsPage() {
  const { profile } = useAuth()
  const [expirations, setExpirations] = useState<Expiration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingExpiration, setEditingExpiration] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Expiration>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Direct query to the expiration table with a more reliable approach
      const { data, error: queryError } = await supabase
        .from("expiration")
        .select("*")
        .order("FULL NAME", { ascending: true })

      if (queryError) {
        console.error("Error querying expiration table:", queryError)
        setError(`Error querying expiration table: ${queryError.message}`)
      } else {
        console.log("Expiration data:", data)
        setExpirations(data || [])
        if (!data || data.length === 0) {
          setDebugInfo("No data found in the expiration table")
        }
      }
    } catch (error: any) {
      console.error("Error in fetchData:", error)
      setError(`Error fetching data: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Explicitly set empty values to null
    setFormData((prev) => ({ ...prev, [name]: value === "" ? null : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    if (!editingExpiration) {
      setError("No expiration selected for editing")
      setIsSubmitting(false)
      return
    }

    // Ensure all empty strings are converted to null before submitting
    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value === "" ? null : value]),
    )

    try {
      const { error: updateError } = await supabase
        .from("expiration")
        .update(cleanedFormData)
        .eq("id", editingExpiration)

      if (updateError) {
        throw updateError
      }

      setSuccess("Expiration dates updated successfully")
      fetchData()
      setEditingExpiration(null)
      setFormData({})
    } catch (error: any) {
      setError(error.message || "Failed to update expiration dates")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter expirations based on search query
  const filteredExpirations = expirations.filter((exp) =>
    exp["FULL NAME"]?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Check if user has permission to view/edit expirations
  if (profile?.role !== "admin" && profile?.role !== "personnel") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
        <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Access Denied</h2>
        <p>You do not have permission to view document expirations.</p>
      </div>
    )
  }

  // Function to fix RLS policies
  const fixRLSPolicies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Execute SQL directly to fix RLS policies
      const { error: policyError } = await supabase.rpc("execute_sql", {
        sql_string: `
          -- Set up Row Level Security (RLS) policies
          ALTER TABLE public.expiration ENABLE ROW LEVEL SECURITY;
          
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

      if (policyError) {
        throw policyError
      }

      setSuccess("RLS policies fixed successfully. Please try your operation again.")
      fetchData()
    } catch (error: any) {
      setError(`Error fixing RLS policies: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Document Expirations</h1>

      {error && (
        <div className="mb-4 flex items-center rounded-md bg-red-50 p-3 text-sm text-red-500">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
          {error.includes("violates row-level security policy") && (
            <button
              onClick={fixRLSPolicies}
              className="ml-4 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
            >
              Fix RLS Policies
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center rounded-md bg-green-50 p-3 text-sm text-green-500">
          <Check className="mr-2 h-4 w-4" />
          {success}
        </div>
      )}

      {debugInfo && (
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-500">
          <p className="font-semibold">Debug Information:</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      {/* Refresh button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Search bar */}
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

      {/* Form for editing expiration dates */}
      {editingExpiration && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Edit Expiration Dates</h2>
          <p className="mb-4 text-sm text-gray-500">Leave fields blank for no expiration date.</p>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label htmlFor="License Expiration" className="mb-1 block text-sm font-medium text-gray-700">
                License Expiration
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  id="License Expiration"
                  name="License Expiration"
                  value={formData["License Expiration"] || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, "License Expiration": null }))}
                  className="ml-2 rounded-md bg-gray-200 px-2 py-2 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="NPC" className="mb-1 block text-sm font-medium text-gray-700">
                NPC
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  id="NPC"
                  name="NPC"
                  value={formData.NPC || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, NPC: null }))}
                  className="ml-2 rounded-md bg-gray-200 px-2 py-2 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="NBI" className="mb-1 block text-sm font-medium text-gray-700">
                NBI
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  id="NBI"
                  name="NBI"
                  value={formData.NBI || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, NBI: null }))}
                  className="ml-2 rounded-md bg-gray-200 px-2 py-2 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="MEDICAL" className="mb-1 block text-sm font-medium text-gray-700">
                MEDICAL
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  id="MEDICAL"
                  name="MEDICAL"
                  value={formData.MEDICAL || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, MEDICAL: null }))}
                  className="ml-2 rounded-md bg-gray-200 px-2 py-2 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="ORIENTATION" className="mb-1 block text-sm font-medium text-gray-700">
                ORIENTATION
              </label>
              <div className="flex items-center">
                <input
                  type="date"
                  id="ORIENTATION"
                  name="ORIENTATION"
                  value={formData.ORIENTATION || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, ORIENTATION: null }))}
                  className="ml-2 rounded-md bg-gray-200 px-2 py-2 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setEditingExpiration(null)
                setFormData({})
              }}
              className="rounded-md bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Document Expiration Dates</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <AlertCircle className="mb-2 h-12 w-12 text-red-400" />
            <p>Error loading expiration data. Please try again later.</p>
          </div>
        ) : filteredExpirations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <Calendar className="mb-2 h-12 w-12 text-gray-400" />
            <p>No expiration data found</p>
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
                    FULL NAME
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    NPC
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    NBI
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    MEDICAL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    ORIENTATION
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    License Expiration
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
                {filteredExpirations.map((expiration) => (
                  <tr key={expiration.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{expiration["FULL NAME"]}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{expiration.NPC ? expiration.NPC : "EMPTY"}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{expiration.NBI ? expiration.NBI : "EMPTY"}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{expiration.MEDICAL ? expiration.MEDICAL : "EMPTY"}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {expiration.ORIENTATION ? expiration.ORIENTATION : "EMPTY"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {expiration["License Expiration"] ? expiration["License Expiration"] : "EMPTY"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingExpiration(expiration.id)
                          setFormData({
                            "License Expiration": expiration["License Expiration"] || "",
                            NPC: expiration.NPC || "",
                            NBI: expiration.NBI || "",
                            MEDICAL: expiration.MEDICAL || "",
                            ORIENTATION: expiration.ORIENTATION || "",
                          })
                        }}
                        className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
                      >
                        Edit
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
