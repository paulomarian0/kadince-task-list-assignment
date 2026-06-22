import { useQuery } from '@apollo/client'
import { useState } from 'react'

import { GET_TASKS } from '@/graphql/queries'
import type { Task, TaskStatusFilter } from '@/types/task'

export function useTasksQuery() {
  const [activeFilter, setActiveFilter] = useState<TaskStatusFilter>('all')
  const statusVariable = activeFilter === 'all' ? undefined : activeFilter

  const { data, loading, error, refetch } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
    variables: { status: statusVariable },
  })

  return {
    tasks: data?.tasks ?? [],
    loading,
    error,
    refetch,
    activeFilter,
    setActiveFilter,
  }
}
