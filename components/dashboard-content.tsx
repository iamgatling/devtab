import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { WidgetGrid } from "@/components/widget-grid"
import { NotesWidget } from "@/components/widgets/notes-widget"
import { TimerWidget } from "@/components/widgets/timer-widget"
import { GithubWidget } from "@/components/widgets/github-widget"
import { GoalsWidget } from "@/components/widgets/goals-widget"
import { PullRequestWidget } from "@/components/widgets/pull-request-widget"

export default function DashboardContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your developer workspace with essential tools.</p>
        <WidgetGrid>
          <NotesWidget />
          <TimerWidget />
          <GithubWidget />
          <PullRequestWidget />
          <GoalsWidget />
        </WidgetGrid>
      </DashboardShell>
    </div>
  )
}
