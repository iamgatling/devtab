"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/context/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  const { isAdmin, users, fetchUsers, totalUsers } = useAdmin()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (isAdmin) {
        await fetchUsers(1)
        setLoading(false)
      }
    }

    loadData()
  }, [isAdmin, fetchUsers])

  // Calculate user statistics
  const activeUsers = users.filter((user) => user.isActive).length
  const adminUsers = users.filter((user) => user.isAdmin).length
  const githubUsers = users.filter((user) => user.authProviders.includes("github.com")).length
  const emailUsers = users.filter((user) => user.authProviders.includes("password")).length
  const multiAuthUsers = users.filter((user) => user.authProviders.length > 1).length

  // Calculate user growth by month (mock data for demonstration)
  const currentDate = new Date()
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(currentDate.getMonth() - i)
    return monthNames[d.getMonth()]
  }).reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">User statistics and platform analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeUsers / totalUsers) * 100)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GitHub Users</CardTitle>
            <div className="h-4 w-4 bg-gray-800 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{githubUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((githubUsers / totalUsers) * 100)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <div className="h-4 w-4 bg-purple-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((adminUsers / totalUsers) * 100)}% of total users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </div>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-[300px] flex items-end justify-between">
                {last6Months.map((month, i) => {
                  // Mock data - in a real app, you'd calculate this from actual user data
                  const height = 30 + Math.floor(Math.random() * 70)
                  return (
                    <div key={month} className="flex flex-col items-center gap-2">
                      <div className="bg-primary/90 w-12 rounded-t-md" style={{ height: `${height}%` }}></div>
                      <span className="text-sm">{month}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Authentication Methods</CardTitle>
              <CardDescription>How users are signing in</CardDescription>
            </div>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Email/Password</p>
                    <p className="text-sm text-muted-foreground">{emailUsers} users</p>
                  </div>
                  <div className="ml-auto font-medium">{Math.round((emailUsers / totalUsers) * 100)}%</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-gray-800"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">GitHub</p>
                    <p className="text-sm text-muted-foreground">{githubUsers} users</p>
                  </div>
                  <div className="ml-auto font-medium">{Math.round((githubUsers / totalUsers) * 100)}%</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Multiple Methods</p>
                    <p className="text-sm text-muted-foreground">{multiAuthUsers} users</p>
                  </div>
                  <div className="ml-auto font-medium">{Math.round((multiAuthUsers / totalUsers) * 100)}%</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>User engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              In a real application, this section would display user activity metrics such as:
            </p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto mt-4 space-y-2">
              <li>Daily active users</li>
              <li>Average session duration</li>
              <li>Feature usage statistics</li>
              <li>Content creation metrics</li>
              <li>Retention and engagement rates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
