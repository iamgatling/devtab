import { Octokit } from "@octokit/rest"

export interface GitHubIssue {
  id: number
  title: string
  html_url: string
  state: string
  repository: {
    name: string
    full_name: string
  }
  created_at: string
  updated_at: string
  labels: Array<{
    name: string
    color: string
  }>
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  html_url: string
  state: string
  merged: boolean
  draft: boolean
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  user: {
    login: string
    avatar_url: string
  }
  repository: {
    name: string
    full_name: string
  }
  requested_reviewers: Array<{
    login: string
    avatar_url: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  reviews: {
    approved: number
    changes_requested: number
    commented: number
    pending: number
  }
  canReview: boolean
}

export type ReviewType = "APPROVE" | "REQUEST_CHANGES" | "COMMENT"

export interface ReviewSubmission {
  pullRequestId: number
  repositoryFullName: string
  pullRequestNumber: number
  reviewType: ReviewType
  comment: string
}

export async function fetchUserIssues(accessToken: string, repoFilter?: string[]): Promise<GitHubIssue[]> {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    })

    // Fetch issues assigned to the authenticated user
    const response = await octokit.issues.list({
      filter: "assigned",
      state: "open",
      per_page: 30,
      sort: "updated",
    })

    // Add repository information to each issue
    let issues = response.data.map((issue) => {
      // Extract repo information from the issue URL
      // Format: https://api.github.com/repos/owner/repo/issues/number
      const urlParts = issue.repository_url.split("/")
      const repoOwner = urlParts[urlParts.length - 2]
      const repoName = urlParts[urlParts.length - 1]
      const repoFullName = `${repoOwner}/${repoName}`

      return {
        id: issue.id,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        repository: {
          name: repoName,
          full_name: repoFullName,
        },
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels as Array<{ name: string; color: string }>,
      }
    })

    // Filter by repository if specified
    if (repoFilter && repoFilter.length > 0) {
      issues = issues.filter((issue) => repoFilter.includes(issue.repository.full_name))
    }

    return issues
  } catch (error) {
    console.error("Error fetching GitHub issues:", error)
    throw error
  }
}

export async function fetchUserPullRequests(
  accessToken: string,
  username: string,
  repoFilter?: string[],
): Promise<GitHubPullRequest[]> {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    })

    // Fetch pull requests created by the authenticated user
    const createdResponse = await octokit.pulls.list({
      state: "open",
      per_page: 30,
      sort: "updated",
    })

    // Fetch pull requests where the authenticated user is requested for review
    const reviewResponse = await octokit.search.issuesAndPullRequests({
      q: "is:pr is:open review-requested:@me",
      per_page: 30,
      sort: "updated",
    })

    // Combine and deduplicate pull requests
    const pullRequestsMap = new Map<number, any>()

    // Process created PRs
    for (const pr of createdResponse.data) {
      const repoUrl = pr.repository_url
      const urlParts = repoUrl.split("/")
      const repoOwner = urlParts[urlParts.length - 2]
      const repoName = urlParts[urlParts.length - 1]
      const repoFullName = `${repoOwner}/${repoName}`

      pullRequestsMap.set(pr.id, {
        ...pr,
        repository: {
          name: repoName,
          full_name: repoFullName,
        },
        reviews: {
          approved: 0,
          changes_requested: 0,
          commented: 0,
          pending: pr.requested_reviewers.length,
        },
        // Can't review your own PRs
        canReview: false,
      })
    }

    // Process PRs where user is requested for review
    for (const item of reviewResponse.data.items) {
      if (!item.pull_request) continue

      // Extract repo information from the issue URL
      const urlParts = item.repository_url.split("/")
      const repoOwner = urlParts[urlParts.length - 2]
      const repoName = urlParts[urlParts.length - 1]
      const repoFullName = `${repoOwner}/${repoName}`

      // Get PR number from the URL
      const prUrlParts = item.pull_request.url.split("/")
      const prNumber = Number.parseInt(prUrlParts[prUrlParts.length - 1], 10)

      // Fetch detailed PR information
      const { data: prDetail } = await octokit.pulls.get({
        owner: repoOwner,
        repo: repoName,
        pull_number: prNumber,
      })

      pullRequestsMap.set(item.id, {
        id: item.id,
        number: prNumber,
        title: item.title,
        html_url: item.html_url,
        state: prDetail.state,
        merged: prDetail.merged,
        draft: prDetail.draft,
        created_at: prDetail.created_at,
        updated_at: prDetail.updated_at,
        closed_at: prDetail.closed_at,
        merged_at: prDetail.merged_at,
        user: {
          login: prDetail.user.login,
          avatar_url: prDetail.user.avatar_url,
        },
        repository: {
          name: repoName,
          full_name: repoFullName,
        },
        requested_reviewers: prDetail.requested_reviewers,
        labels: item.labels,
        reviews: {
          approved: 0,
          changes_requested: 0,
          commented: 0,
          pending: prDetail.requested_reviewers.length,
        },
        // Can review if you're requested as a reviewer and it's not your own PR
        canReview: prDetail.user.login !== username,
      })
    }

    // Convert map to array
    let pullRequests = Array.from(pullRequestsMap.values())

    // Fetch review information for each PR
    for (const pr of pullRequests) {
      try {
        const repoFullName = pr.repository.full_name
        const [owner, repo] = repoFullName.split("/")

        const { data: reviews } = await octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: pr.number,
        })

        // Count review states
        const reviewCounts = {
          approved: 0,
          changes_requested: 0,
          commented: 0,
          pending: pr.requested_reviewers.length,
        }

        // Get the latest review from each reviewer
        const latestReviews = new Map()
        for (const review of reviews) {
          const reviewer = review.user.login
          const existingReview = latestReviews.get(reviewer)

          if (!existingReview || new Date(review.submitted_at) > new Date(existingReview.submitted_at)) {
            latestReviews.set(reviewer, review)
          }
        }

        // Count the latest review states
        for (const review of latestReviews.values()) {
          switch (review.state) {
            case "APPROVED":
              reviewCounts.approved++
              break
            case "CHANGES_REQUESTED":
              reviewCounts.changes_requested++
              break
            case "COMMENTED":
              reviewCounts.commented++
              break
          }
        }

        pr.reviews = reviewCounts

        // Check if the authenticated user has already submitted a review
        const userReview = reviews.find((review) => review.user.login === username)
        if (userReview) {
          // If the user has already reviewed, they can update their review
          pr.canReview = true
        }
      } catch (error) {
        console.error(`Error fetching reviews for PR #${pr.number}:`, error)
      }
    }

    // Filter by repository if specified
    if (repoFilter && repoFilter.length > 0) {
      pullRequests = pullRequests.filter((pr) => repoFilter.includes(pr.repository.full_name))
    }

    return pullRequests
  } catch (error) {
    console.error("Error fetching GitHub pull requests:", error)
    throw error
  }
}

export async function submitPullRequestReview(
  accessToken: string,
  review: ReviewSubmission,
): Promise<{ success: boolean; message: string }> {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    })

    const [owner, repo] = review.repositoryFullName.split("/")

    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: review.pullRequestNumber,
      event: review.reviewType,
      body: review.comment,
    })

    return {
      success: true,
      message: "Review submitted successfully",
    }
  } catch (error) {
    console.error("Error submitting pull request review:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    })

    // Fetch repositories the user has access to
    const response = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    })

    return response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      private: repo.private,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }))
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error)
    throw error
  }
}

export async function getUserProfile(accessToken: string) {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    })

    const { data } = await octokit.users.getAuthenticated()
    return data
  } catch (error) {
    console.error("Error fetching GitHub profile:", error)
    throw error
  }
}
