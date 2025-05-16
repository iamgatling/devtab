"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  GitMerge,
  Github,
  MessageSquare,
  RefreshCw,
  X,
} from "lucide-react"
import { useGitHub } from "@/context/github-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ReviewDialog } from "@/components/github/review-dialog"

export function PullRequestWidget() {
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

  // Limit the number of PRs shown in the widget
  const displayPRs = pullRequests.slice(0, 3)

  return (
    <>
      <Card className="col-span-1 row-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Pull Requests</CardTitle>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh pull requests</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-8 w-8 ${selectedRepos.length > 0 ? "bg-primary/10" : ""}`}
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Filter repositories</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Filter Repositories</span>
                    {selectedRepos.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          clearRepoFilters()
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[200px]">
                    {reposWithPRs.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No repositories found</div>
                    ) : (
                      reposWithPRs.map((repo) => (
                        <DropdownMenuCheckboxItem
                          key={repo.id}
                          checked={selectedRepos.includes(repo.full_name)}
                          onCheckedChange={() => toggleRepoFilter(repo.full_name)}
                        >
                          {repo.full_name}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={connectGitHub}>
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Connect</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-2">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center p-4">
              <Github className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Connect your GitHub account to see your pull requests
              </p>
              <Button onClick={connectGitHub} size="sm">
                Connect GitHub
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border p-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : pullRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center p-4">
              <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
              <p className="text-sm text-muted-foreground mb-2">
                {selectedRepos.length > 0
                  ? "No pull requests in the selected repositories"
                  : "No open pull requests found"}
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <>
              {selectedRepos.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {selectedRepos.map((repo) => (
                    <Badge key={repo} variant="secondary" className="flex items-center gap-1">
                      {repo.split("/")[1]}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => toggleRepoFilter(repo)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove filter</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              <ScrollArea className="h-[180px] pr-4">
                <div className="space-y-4">
                  {displayPRs.map((pr) => (
                    <div key={pr.id} className="flex items-start gap-2 rounded-md border p-3">
                      <div className="mt-0.5">{getPrStatusIcon(pr)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium leading-none hover:underline flex items-center gap-1"
                          >
                            {pr.title}
                            <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        </div>
                        <div className="flex flex-wrap items-center mt-1">
                          <Badge variant="outline">{getPrStatusText(pr)}</Badge>
                          {getReviewStatus(pr)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={pr.user.avatar_url || "/placeholder.svg"} alt={pr.user.login} />
                              <AvatarFallback>{pr.user.login.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">{pr.repository.full_name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {pr.canReview && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleReviewClick(pr)}
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Review this PR</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <p className="text-xs text-muted-foreground">Updated: {formatDate(pr.updated_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
        {isConnected && pullRequests.length > 3 && (
          <CardFooter className="px-2 pt-0">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/github/pull-requests">View All Pull Requests ({pullRequests.length})</Link>
            </Button>
          </CardFooter>
        )}
      </Card>

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
