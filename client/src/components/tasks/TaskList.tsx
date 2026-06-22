import type { Task } from '@/types/task'

import { TaskEmptyState } from './TaskEmptyState'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onComplete: (task: Task) => void
  onReopen: (task: Task) => void
  onDelete: (task: Task) => void
  isUpdating?: boolean
}

export function TaskList({
  tasks,
  loading,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
  isUpdating,
}: TaskListProps) {
  if (!loading && tasks.length === 0) {
    return <TaskEmptyState />
  }

  return (
    <div className="space-y-3" data-testid="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onComplete={onComplete}
          onReopen={onReopen}
          onDelete={onDelete}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  )
}
