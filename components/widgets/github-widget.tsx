"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle, Clock, ExternalLink, Filter, Github, RefreshCw, X } from "lucide-react"
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

export function GithubWidget() {
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
  const [showFilters, setShowFilters] = useState(false)

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

  // Limit the number of issues shown in the widget
  const displayIssues = issues.slice(0, 3)

  return (
    <Card className="col-span-1 row-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">GitHub Issues</CardTitle>
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
                  <p>Refresh issues</p>
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
                  {reposWithIssues.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No repositories found</div>
                  ) : (
                    reposWithIssues.map((repo) => (
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

            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || ""} alt={username || "GitHub User"} />
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
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
              Connect your GitHub account to see your assigned issues
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
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[220px] text-center p-4">
            <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
            <p className="text-sm text-muted-foreground mb-2">
              {selectedRepos.length > 0
                ? "No open issues in the selected repositories"
                : "No open issues assigned to you"}
            </p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={disconnectGitHub}>
                Disconnect
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
                {displayIssues.map((issue) => (
                  <div key={issue.id} className="flex items-start gap-2 rounded-md border p-3">
                    <div className="mt-0.5">{getStateIcon(issue.state)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={issue.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium leading-none hover:underline flex items-center gap-1"
                        >
                          {issue.title}
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      </div>
                      <div className="flex flex-wrap mt-1">{issue.labels.map((label) => getLabelBadge(label))}</div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">{issue.repository.full_name}</p>
                        <p className="text-xs text-muted-foreground">Updated: {formatDate(issue.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
      {isConnected && issues.length > 3 && (
        <CardFooter className="px-2 pt-0">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/github">View All Issues ({issues.length})</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
