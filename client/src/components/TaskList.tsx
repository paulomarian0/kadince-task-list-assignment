import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import {
  COMPLETE_TASK,
  CREATE_TASK,
  DELETE_TASK,
  REOPEN_TASK,
  UPDATE_TASK,
} from '../graphql/mutations'
import { GET_TASKS } from '../graphql/queries'
import type { Task, TaskStatusFilter } from '../types/task'
import { TaskFilters } from './TaskFilters'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'

export function TaskList() {
  const [activeFilter, setActiveFilter] = useState<TaskStatusFilter>('all')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const statusVariable = activeFilter === 'all' ? undefined : activeFilter

  const { data, loading, error, refetch } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
    variables: { status: statusVariable },
  })

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    onCompleted: (result) => {
      if (result.createTask.errors.length > 0) {
        setMutationError(result.createTask.errors.join(', '))
        return
      }
      setMutationError(null)
      refetch()
    },
    onError: (apolloError) => setMutationError(apolloError.message),
  })

  const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, {
    onCompleted: (result) => {
      if (result.updateTask.errors.length > 0) {
        setMutationError(result.updateTask.errors.join(', '))
        return
      }
      setMutationError(null)
      setEditingTask(null)
      refetch()
    },
    onError: (apolloError) => setMutationError(apolloError.message),
  })

  const [completeTask] = useMutation(COMPLETE_TASK, {
    optimisticResponse: (variables) => ({
      completeTask: {
        __typename: 'CompleteTaskPayload',
        task: {
          __typename: 'Task',
          id: variables.id,
          completed: true,
        },
        errors: [],
      },
    }),
    onCompleted: (result) => {
      if (result.completeTask.errors.length > 0) {
        setMutationError(result.completeTask.errors.join(', '))
      } else {
        setMutationError(null)
      }
      refetch()
    },
    onError: (apolloError) => {
      setMutationError(apolloError.message)
      refetch()
    },
  })

  const [reopenTask] = useMutation(REOPEN_TASK, {
    optimisticResponse: (variables) => ({
      reopenTask: {
        __typename: 'ReopenTaskPayload',
        task: {
          __typename: 'Task',
          id: variables.id,
          completed: false,
        },
        errors: [],
      },
    }),
    onCompleted: (result) => {
      if (result.reopenTask.errors.length > 0) {
        setMutationError(result.reopenTask.errors.join(', '))
      } else {
        setMutationError(null)
      }
      refetch()
    },
    onError: (apolloError) => {
      setMutationError(apolloError.message)
      refetch()
    },
  })

  const [deleteTask] = useMutation(DELETE_TASK, {
    optimisticResponse: (variables) => ({
      deleteTask: {
        __typename: 'DeleteTaskPayload',
        task: {
          __typename: 'Task',
          id: variables.id,
        },
        errors: [],
      },
    }),
    onCompleted: (result) => {
      const deletedId = result.deleteTask.task?.id
      if (result.deleteTask.errors.length > 0) {
        setMutationError(result.deleteTask.errors.join(', '))
      } else {
        setMutationError(null)
        if (editingTask?.id === deletedId) {
          setEditingTask(null)
        }
      }
      refetch()
    },
    onError: (apolloError) => {
      setMutationError(apolloError.message)
      refetch()
    },
  })

  const tasks = data?.tasks ?? []
  const isBusy = creating || updating

  const handleCreate = async (values: { title: string; description: string }) => {
    await createTask({ variables: values })
  }

  const handleUpdate = async (values: { title: string; description: string }) => {
    if (!editingTask) return
    await updateTask({
      variables: {
        id: editingTask.id,
        title: values.title,
        description: values.description,
      },
    })
  }

  return (
    <div className="task-app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p>Manage your tasks with GraphQL-powered updates.</p>
      </header>

      <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {mutationError && (
        <div className="error-banner" data-testid="mutation-error">
          {mutationError}
          <button type="button" onClick={() => setMutationError(null)}>Dismiss</button>
        </div>
      )}

      {loading && !data && (
        <div className="loading-state" data-testid="loading-state">
          Loading tasks...
        </div>
      )}

      {error && (
        <div className="error-banner" data-testid="query-error">
          Failed to load tasks: {error.message}
          <button type="button" data-testid="retry-load" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <div className="task-layout">
        <section className="task-panel">
          <TaskForm mode="create" onSubmit={handleCreate} isSubmitting={creating} />

          {editingTask && (
            <TaskForm
              mode="edit"
              task={editingTask}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTask(null)}
              isSubmitting={updating}
            />
          )}
        </section>

        <section className="task-panel">
          <h2>Tasks</h2>
          {!loading && tasks.length === 0 && (
            <p className="empty-state" data-testid="empty-state">No tasks found for this filter.</p>
          )}

          <div className="task-list" data-testid="task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={setEditingTask}
                onComplete={(selectedTask) =>
                  completeTask({ variables: { id: selectedTask.id } })
                }
                onReopen={(selectedTask) =>
                  reopenTask({ variables: { id: selectedTask.id } })
                }
                onDelete={(selectedTask) =>
                  deleteTask({ variables: { id: selectedTask.id } })
                }
                isUpdating={isBusy}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
