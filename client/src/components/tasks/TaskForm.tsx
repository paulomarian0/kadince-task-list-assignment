import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Task } from '@/types/task'

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
    <Card data-testid={mode === 'create' ? 'create-task-form' : 'edit-task-form'}>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Task' : 'Edit Task'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Add a new task to your list.'
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
