"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, Upload, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [_user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Employees</div>
            <p className="text-xs text-muted-foreground">Add and manage security employees</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/employees">View Employees</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Files</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Documents</div>
            <p className="text-xs text-muted-foreground">Upload and update 201 files</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/upload">Go to Upload</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Access Documents</div>
            <p className="text-xs text-muted-foreground">View and download employee files</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/files">View Files</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Track Expirations</div>
            <p className="text-xs text-muted-foreground">Monitor document expiration dates</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/expirations">View Expirations</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Eagle Stryke Security Management System</CardTitle>
          <CardDescription>
            This system helps you manage security employee documents and track expirations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Shield className="h-12 w-12 text-green-600" />
            <div>
              <h3 className="text-lg font-medium">Eagle Stryke Security Agency</h3>
              <p className="text-sm text-muted-foreground">Document Management System</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
