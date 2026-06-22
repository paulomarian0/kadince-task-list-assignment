import { ClipboardList } from 'lucide-react'

export function TaskEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center"
      data-testid="empty-state"
    >
      <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">No tasks found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try a different filter or create a new task.
      </p>
    </div>
  )
}
