"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { useGitHub } from "@/context/github-context"
import type { GitHubPullRequest, ReviewType } from "@/lib/github"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReviewDialogProps {
  pullRequest: GitHubPullRequest
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReviewDialog({ pullRequest, isOpen, onClose, onSuccess }: ReviewDialogProps) {
  const { submitReview } = useGitHub()
  const [reviewType, setReviewType] = useState<ReviewType>("COMMENT")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (reviewType === "REQUEST_CHANGES" && !comment.trim()) {
      setError("A comment is required when requesting changes")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitReview({
        pullRequestId: pullRequest.id,
        repositoryFullName: pullRequest.repository.full_name,
        pullRequestNumber: pullRequest.number,
        reviewType,
        comment,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred while submitting your review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReviewType("COMMENT")
      setComment("")
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Pull Request</DialogTitle>
          <DialogDescription>
            {pullRequest.repository.full_name} #{pullRequest.number}: {pullRequest.title}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-center">Your review has been submitted successfully!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <Tabs defaultValue="comment" onValueChange={(value) => setReviewType(value as ReviewType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="COMMENT">Comment</TabsTrigger>
                  <TabsTrigger value="APPROVE">Approve</TabsTrigger>
                  <TabsTrigger value="REQUEST_CHANGES">Request Changes</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="comment">
                  {reviewType === "REQUEST_CHANGES" ? (
                    <span className="text-red-500">* Comment (required)</span>
                  ) : (
                    "Comment (optional)"
                  )}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={
                    reviewType === "APPROVE"
                      ? "Looks good to me!"
                      : reviewType === "REQUEST_CHANGES"
                        ? "Please make the following changes..."
                        : "Add your comments here..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
