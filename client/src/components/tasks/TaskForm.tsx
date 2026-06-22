import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Task, TaskPriority } from '@/types/task'

interface TaskFormValues {
  title: string
  description: string
  priority?: TaskPriority
}

interface TaskFormProps {
  mode: 'create' | 'edit'
  task?: Task
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

const priorityOptions: { value: '' | TaskPriority; label: string }[] = [
  { value: '', label: 'Auto (AI infers)' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

export function TaskForm({ mode, task, onSubmit, onCancel, isSubmitting }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<'' | TaskPriority>(task?.priority ?? '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setPriority(task?.priority ?? '')
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
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority: priority || undefined,
      })
      if (mode === 'create') {
        setTitle('')
        setDescription('')
        setPriority('')
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong')
    }
  }

  return (
    <Card data-testid={mode === 'create' ? 'create-task-form' : 'edit-task-form'}>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Task' : 'Edit Task'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Add a new task. Leave priority empty to let AI infer it.'
            : 'Update the details of this task.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-title`}>Title</Label>
            <Input
              id={`${mode}-title`}
              data-testid={`${mode}-task-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-description`}>Description</Label>
            <Textarea
              id={`${mode}-description`}
              data-testid={`${mode}-task-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Task description"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-priority`}>Priority</Label>
            <select
              id={`${mode}-priority`}
              data-testid={`${mode}-task-priority`}
              value={priority}
              onChange={(event) => setPriority(event.target.value as '' | TaskPriority)}
              disabled={isSubmitting}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {priorityOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-destructive" data-testid="form-error">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" data-testid={`${mode}-task-submit`} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Button>
            {mode === 'edit' && onCancel && (
              <Button
                type="button"
                variant="outline"
                data-testid="cancel-edit"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
