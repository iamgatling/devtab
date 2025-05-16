"use client"

import { useState } from "react"
import Link from "next/link"
import { useGitHub } from "@/context/github-context"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  ExternalLink,
  GitMerge,
  Github,
  MessageSquare,
  RefreshCw,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ReviewDialog } from "@/components/github/review-dialog"

export default function PullRequestsPage() {
  const {
    isConnected,
    isLoading,
    pullRequests,
    repos,
    username,
    avatarUrl,
    selectedRepos,
    connectGitHub,
    disconnectGitHub,
    refreshPullRequests,
    toggleRepoFilter,
    clearRepoFilters,
  } = useGitHub()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPR, setSelectedPR] = useState<any | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshPullRequests()
    setIsRefreshing(false)
  }

  const handleReviewClick = (pr: any) => {
    setSelectedPR(pr)
    setIsReviewDialogOpen(true)
  }

  const getPrStatusIcon = (pr: any) => {
    if (pr.state === "closed") {
      if (pr.merged) {
        return <GitMerge className="h-4 w-4 text-purple-500" />
      }
      return <X className="h-4 w-4 text-red-500" />
    }
    if (pr.draft) {
      return <Clock className="h-4 w-4 text-gray-500" />
    }
    return <AlertCircle className="h-4 w-4 text-green-500" />
  }

  const getPrStatusText = (pr: any) => {
    if (pr.state === "closed") {
      if (pr.merged) {
        return "Merged"
      }
      return "Closed"
    }
    if (pr.draft) {
      return "Draft"
    }
    return "Open"
  }

  const getReviewStatus = (pr: any) => {
    const { approved, changes_requested, commented, pending } = pr.reviews

    if (changes_requested > 0) {
      return (
        <Badge variant="destructive" className="ml-1">
          Changes requested
        </Badge>
      )
    }

    if (approved > 0 && pending === 0) {
      return (
        <Badge variant="success" className="ml-1 bg-green-500">
          Approved
        </Badge>
      )
    }

    if (approved > 0) {
      return (
        <Badge variant="outline" className="ml-1">
          {approved} approved, {pending} pending
        </Badge>
      )
    }

    if (pending > 0) {
      return (
        <Badge variant="outline" className="ml-1">
          {pending} pending reviews
        </Badge>
      )
    }

    if (commented > 0) {
      return (
        <Badge variant="outline" className="ml-1">
          {commented} comments
        </Badge>
      )
    }

    return null
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get unique repositories from pull requests
  const uniqueReposFromPRs = [...new Set(pullRequests.map((pr) => pr.repository.full_name))]

  // Get repositories that have pull requests
  const reposWithPRs = repos
    .filter((repo) => uniqueReposFromPRs.includes(repo.full_name))
    .sort((a, b) => a.full_name.localeCompare(b.full_name))

  // Filter pull requests by search term and status
  const filteredPRs = pullRequests.filter((pr) => {
    // Filter by search term
    const matchesSearch =
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.repository.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.user.login.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status
    let matchesStatus = true
    if (statusFilter === "open") {
      matchesStatus = pr.state === "open" && !pr.draft
    } else if (statusFilter === "draft") {
      matchesStatus = pr.draft === true
    } else if (statusFilter === "merged") {
      matchesStatus = pr.merged === true
    } else if (statusFilter === "closed") {
      matchesStatus = pr.state === "closed" && !pr.merged
    }

    return matchesSearch && matchesStatus
  })

  return (
    <>
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
              <h1 className="text-2xl font-semibold tracking-tight">Pull Requests</h1>
              <p className="text-muted-foreground">Manage and track your GitHub pull requests</p>
            </div>
          </div>

          {!isConnected ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Github className="h-16 w-16 mb-6 text-muted-foreground" />
                <CardTitle className="text-xl mb-2">Connect GitHub</CardTitle>
                <CardDescription className="mb-6 max-w-md">
                  Connect your GitHub account to see and manage your pull requests directly from this dashboard.
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
                      {reposWithPRs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No repositories found</p>
                      ) : (
                        reposWithPRs.map((repo) => (
                          <div
                            key={repo.id}
                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                              selectedRepos.includes(repo.full_name)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted/50"
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
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      placeholder="Search pull requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-md"
                    />
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="open">Open</TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                        <TabsTrigger value="merged">Merged</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Pull Requests</CardTitle>
                      <CardDescription>
                        {selectedRepos.length > 0
                          ? `Showing pull requests from ${selectedRepos.length} selected ${
                              selectedRepos.length === 1 ? "repository" : "repositories"
                            }`
                          : "Showing all pull requests"}
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
                      ) : filteredPRs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                          <p className="text-muted-foreground mb-2">
                            {searchTerm
                              ? "No pull requests match your search"
                              : selectedRepos.length > 0
                                ? "No pull requests in the selected repositories"
                                : "No pull requests found"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredPRs.map((pr) => (
                            <div key={pr.id} className="flex items-start gap-3 rounded-md border p-4">
                              <div className="mt-0.5">{getPrStatusIcon(pr)}</div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <a
                                    href={pr.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base font-medium hover:underline flex items-center gap-1"
                                  >
                                    {pr.title}
                                    <ExternalLink className="h-3.5 w-3.5 inline" />
                                  </a>
                                  {pr.canReview && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 gap-1"
                                            onClick={() => handleReviewClick(pr)}
                                          >
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Review</span>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Submit a review for this PR</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center">
                                  <Badge variant="outline">{getPrStatusText(pr)}</Badge>
                                  {getReviewStatus(pr)}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={pr.user.avatar_url || "/placeholder.svg"} alt={pr.user.login} />
                                      <AvatarFallback>{pr.user.login.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{pr.user.login}</span>
                                    <Badge variant="outline">{pr.repository.full_name}</Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <span>Created: {formatDate(pr.created_at)}</span>
                                    <span>Updated: {formatDate(pr.updated_at)}</span>
                                    {pr.merged_at && <span>Merged: {formatDate(pr.merged_at)}</span>}
                                    {pr.closed_at && !pr.merged_at && <span>Closed: {formatDate(pr.closed_at)}</span>}
                                  </div>
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

      {selectedPR && (
        <ReviewDialog
          pullRequest={selectedPR}
          isOpen={isReviewDialogOpen}
          onClose={() => setIsReviewDialogOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </>
  )
}
