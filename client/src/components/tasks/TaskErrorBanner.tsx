import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface TaskErrorBannerProps {
  testId: string
  title: string
  message: string
  onDismiss?: () => void
  onRetry?: () => void
  retryTestId?: string
}

export function TaskErrorBanner({
  testId,
  title,
  message,
  onDismiss,
  onRetry,
  retryTestId,
}: TaskErrorBannerProps) {
  return (
    <Alert variant="destructive" className="mb-6" data-testid={testId}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        <div className="flex gap-2">
          {onRetry && (
            <Button type="button" size="sm" variant="outline" data-testid={retryTestId} onClick={onRetry}>
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
