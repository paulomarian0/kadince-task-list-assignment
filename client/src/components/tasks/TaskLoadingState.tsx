import { Skeleton } from '@/components/ui/skeleton'

export function TaskLoadingState() {
  return (
    <div className="space-y-3" data-testid="loading-state">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  )
}
