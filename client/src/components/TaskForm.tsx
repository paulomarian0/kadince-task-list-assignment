import { useEffect, useState } from 'react'
import type { Task } from '../types/task'

interface TaskFormProps {
  mode: 'create' | 'edit'
  task?: Task
  onSubmit: (values: { title: string; description: string }) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function TaskForm({ mode, task, onSubmit, onCancel, isSubmitting }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setError(null)
  }, [task])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      await onSubmit({ title: title.trim(), description: description.trim() })
      if (mode === 'create') {
        setTitle('')
        setDescription('')
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong')
    }
  }

  return (
    <form
      className="task-form"
      data-testid={mode === 'create' ? 'create-task-form' : 'edit-task-form'}
      onSubmit={handleSubmit}
    >
      <h2>{mode === 'create' ? 'Create Task' : 'Edit Task'}</h2>

      <label htmlFor={`${mode}-title`}>Title</label>
      <input
        id={`${mode}-title`}
        data-testid={`${mode}-task-title`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        disabled={isSubmitting}
      />

      <label htmlFor={`${mode}-description`}>Description</label>
      <textarea
        id={`${mode}-description`}
        data-testid={`${mode}-task-description`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Task description"
        rows={3}
        disabled={isSubmitting}
      />

      {error && <p className="form-error" data-testid="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" data-testid={`${mode}-task-submit`} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
        </button>
        {mode === 'edit' && onCancel && (
          <button type="button" data-testid="cancel-edit" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
