import { CheckCircle2, Pencil, RotateCcw, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onComplete: (task: Task) => void
  onReopen: (task: Task) => void
  onDelete: (task: Task) => void
  isUpdating?: boolean
}

export function TaskItem({
  task,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
  isUpdating,
}: TaskItemProps) {
  return (
    <Card
      className="transition-shadow hover:shadow-md"
      data-testid="task-item"
      data-task-id={task.id}
    >
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <h3
            className={cn(
              'text-base font-semibold text-foreground',
              task.completed && 'line-through opacity-60',
            )}
            data-testid="task-title"
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground" data-testid="task-description">
              {task.description}
            </p>
          )}
          <Badge
            variant={task.completed ? 'success' : 'pending'}
            data-testid="task-status"
          >
            {task.completed ? 'Completed' : 'Pending'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="edit-task"
            onClick={() => onEdit(task)}
            disabled={isUpdating}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          {task.completed ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="reopen-task"
              onClick={() => onReopen(task)}
              disabled={isUpdating}
            >
              <RotateCcw className="h-4 w-4" />
              Reopen
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="complete-task"
              onClick={() => onComplete(task)}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            data-testid="delete-task"
            onClick={() => onDelete(task)}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
