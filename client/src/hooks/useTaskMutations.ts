import { useMutation } from '@apollo/client'
import { useState } from 'react'

import {
  COMPLETE_TASK,
  CREATE_TASK,
  DELETE_TASK,
  REOPEN_TASK,
  UPDATE_TASK,
} from '@/graphql/mutations'
import type { Task, TaskPriority } from '@/types/task'

interface UseTaskMutationsOptions {
  refetch: () => void
}

export function useTaskMutations({ refetch }: UseTaskMutationsOptions) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

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
        task: { __typename: 'Task', id: variables.id, completed: true },
        errors: [],
      },
    }),
    onCompleted: (result) => {
      setMutationError(
        result.completeTask.errors.length > 0
          ? result.completeTask.errors.join(', ')
          : null,
      )
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
        task: { __typename: 'Task', id: variables.id, completed: false },
        errors: [],
      },
    }),
    onCompleted: (result) => {
      setMutationError(
        result.reopenTask.errors.length > 0
          ? result.reopenTask.errors.join(', ')
          : null,
      )
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
        task: { __typename: 'Task', id: variables.id },
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

  const handleCreate = async (values: {
    title: string
    description: string
    priority?: TaskPriority
  }) => {
    await createTask({ variables: values })
  }

  const handleUpdate = async (values: {
    title: string
    description: string
    priority?: TaskPriority
  }) => {
    if (!editingTask) return
    await updateTask({
      variables: {
        id: editingTask.id,
        title: values.title,
        description: values.description,
        priority: values.priority,
      },
    })
  }

  return {
    editingTask,
    setEditingTask,
    mutationError,
    clearMutationError: () => setMutationError(null),
    creating,
    updating,
    isBusy: creating || updating,
    handleCreate,
    handleUpdate,
    completeTask: (task: Task) => completeTask({ variables: { id: task.id } }),
    reopenTask: (task: Task) => reopenTask({ variables: { id: task.id } }),
    deleteTask: (task: Task) => deleteTask({ variables: { id: task.id } }),
  }
}
