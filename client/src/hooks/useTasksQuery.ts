import { useQuery } from '@apollo/client'
import { useCallback, useState } from 'react'

import { GET_TASKS } from '@/graphql/queries'
import type { Task, TaskSearchFilters, TaskStatusFilter } from '@/types/task'

export function useTasksQuery() {
  const [activeFilter, setActiveFilter] = useState<TaskStatusFilter>('all')
  const [searchText, setSearchText] = useState('')

  const statusVariable = activeFilter === 'all' ? undefined : activeFilter
  const searchVariable = searchText.trim() || undefined

  const { data, loading, error, refetch } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
    variables: {
      status: statusVariable,
      search: searchVariable,
    },
  })

  const applySearchFilters = useCallback((filters: TaskSearchFilters) => {
    if (filters.status && ['all', 'pending', 'completed'].includes(filters.status)) {
      setActiveFilter(filters.status as TaskStatusFilter)
    } else {
      setActiveFilter('all')
    }

    setSearchText(filters.search ?? '')
  }, [])

  const clearSearch = useCallback(() => {
    setSearchText('')
    setActiveFilter('all')
  }, [])

  return {
    tasks: data?.tasks ?? [],
    loading,
    error,
    refetch,
    activeFilter,
    setActiveFilter,
    searchText,
    setSearchText,
    applySearchFilters,
    clearSearch,
  }
}
