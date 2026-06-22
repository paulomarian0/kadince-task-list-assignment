import type { Task } from '../types/task'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onComplete: (task: Task) => void
  onReopen: (task: Task) => void
  onDelete: (task: Task) => void
  isUpdating?: boolean
}

export function TaskItem({ task, onEdit, onComplete, onReopen, onDelete, isUpdating }: TaskItemProps) {
  return (
    <article
      className={task.completed ? 'task-item completed' : 'task-item'}
      data-testid="task-item"
      data-task-id={task.id}
    >
      <div className="task-content">
        <h3 data-testid="task-title">{task.title}</h3>
        {task.description && <p data-testid="task-description">{task.description}</p>}
        <span className="task-status" data-testid="task-status">
          {task.completed ? 'Completed' : 'Pending'}
        </span>
      </div>

      <div className="task-actions">
        <button
          type="button"
          data-testid="edit-task"
          onClick={() => onEdit(task)}
          disabled={isUpdating}
        >
          Edit
        </button>
        {task.completed ? (
          <button
            type="button"
            data-testid="reopen-task"
            onClick={() => onReopen(task)}
            disabled={isUpdating}
          >
            Reopen
          </button>
        ) : (
          <button
            type="button"
            data-testid="complete-task"
            onClick={() => onComplete(task)}
            disabled={isUpdating}
          >
            Complete
          </button>
        )}
        <button
          type="button"
          data-testid="delete-task"
          className="danger"
          onClick={() => onDelete(task)}
          disabled={isUpdating}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
