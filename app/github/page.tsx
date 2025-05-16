"use client"

import { useState } from "react"
import Link from "next/link"
import { useGitHub } from "@/context/github-context"
import { AlertCircle, ArrowLeft, CheckCircle, Clock, ExternalLink, Github, RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function GitHubPage() {
  const {
    isConnected,
    isLoading,
    issues,
    repos,
    username,
    avatarUrl,
    selectedRepos,
    connectGitHub,
    disconnectGitHub,
    refreshIssues,
    toggleRepoFilter,
    clearRepoFilters,
  } = useGitHub()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshIssues()
    setIsRefreshing(false)
  }

  const getStateIcon = (state: string) => {
    switch (state) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "closed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getLabelBadge = (label: { name: string; color: string }) => {
    return (
      <Badge
        key={label.name}
        variant="outline"
        style={{
          backgroundColor: `#${label.color}20`,
          borderColor: `#${label.color}`,
          color: getBrightness(label.color) > 128 ? "#000" : "#fff",
        }}
        className="mr-1 mb-1"
      >
        {label.name}
      </Badge>
    )
  }

  // Helper function to determine if a color is light or dark
  const getBrightness = (hexColor: string) => {
    const r = Number.parseInt(hexColor.substr(0, 2), 16)
    const g = Number.parseInt(hexColor.substr(2, 2), 16)
    const b = Number.parseInt(hexColor.substr(4, 2), 16)
    return (r * 299 + g * 587 + b * 114) / 1000
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get unique repositories from issues
  const uniqueReposFromIssues = [...new Set(issues.map((issue) => issue.repository.full_name))]

  // Get repositories that have issues
  const reposWithIssues = repos
    .filter((repo) => uniqueReposFromIssues.includes(repo.full_name))
    .sort((a, b) => a.full_name.localeCompare(b.full_name))

  // Filter issues by search term
  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.repository.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.labels.some((label) => label.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">GitHub Issues</h1>
            <p className="text-muted-foreground">Manage and track your GitHub issues</p>
          </div>
        </div>

        {!isConnected ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Github className="h-16 w-16 mb-6 text-muted-foreground" />
              <CardTitle className="text-xl mb-2">Connect GitHub</CardTitle>
              <CardDescription className="mb-6 max-w-md">
                Connect your GitHub account to see and manage your assigned issues directly from this dashboard.
              </CardDescription>
              <Button onClick={connectGitHub} className="gap-2">
                <Github className="h-4 w-4" />
                Connect GitHub Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl || ""} alt={username || "GitHub User"} />
                  <AvatarFallback>GH</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{username}</p>
                  <p className="text-sm text-muted-foreground">Connected to GitHub</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={disconnectGitHub} className="gap-2">
                  <X className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[250px_1fr]">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">Repositories</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedRepos.length > 0 && (
                    <div className="mb-4">
                      <Button variant="outline" size="sm" onClick={clearRepoFilters} className="w-full gap-2">
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                  <div className="space-y-1">
                    {reposWithIssues.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No repositories found</p>
                    ) : (
                      reposWithIssues.map((repo) => (
                        <div
                          key={repo.id}
                          className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                            selectedRepos.includes(repo.full_name) ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                          }`}
                          role="button"
                          onClick={() => toggleRepoFilter(repo.full_name)}
                        >
                          <span className="truncate">{repo.full_name}</span>
                          {selectedRepos.includes(repo.full_name) && <CheckCircle className="h-4 w-4 ml-2" />}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Issues</CardTitle>
                    <CardDescription>
                      {selectedRepos.length > 0
                        ? `Showing issues from ${selectedRepos.length} selected ${
                            selectedRepos.length === 1 ? "repository" : "repositories"
                          }`
                        : "Showing all issues assigned to you"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-start gap-2 rounded-md border p-3">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <div className="space-y-2 w-full">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredIssues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                        <p className="text-muted-foreground mb-2">
                          {searchTerm
                            ? "No issues match your search"
                            : selectedRepos.length > 0
                              ? "No open issues in the selected repositories"
                              : "No open issues assigned to you"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredIssues.map((issue) => (
                          <div key={issue.id} className="flex items-start gap-3 rounded-md border p-4">
                            <div className="mt-0.5">{getStateIcon(issue.state)}</div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <a
                                  href={issue.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-base font-medium hover:underline flex items-center gap-1"
                                >
                                  {issue.title}
                                  <ExternalLink className="h-3.5 w-3.5 inline" />
                                </a>
                              </div>
                              <div className="flex flex-wrap">{issue.labels.map((label) => getLabelBadge(label))}</div>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{issue.repository.full_name}</Badge>
                                <p className="text-xs text-muted-foreground">Updated: {formatDate(issue.updated_at)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </div>
  )
}
