import { useQuery } from '@apollo/client'
import { useCallback, useState } from 'react'

import { GET_TASKS } from '@/graphql/queries'
import type { Task, TaskPriorityFilter, TaskSearchFilters, TaskStatusFilter } from '@/types/task'

export function useTasksQuery() {
  const [activeFilter, setActiveFilter] = useState<TaskStatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('all')
  const [searchText, setSearchText] = useState('')

  const statusVariable = activeFilter === 'all' ? undefined : activeFilter
  const priorityVariable = priorityFilter === 'all' ? undefined : priorityFilter
  const searchVariable = searchText.trim() || undefined

  const { data, loading, error, refetch } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
    variables: {
      status: statusVariable,
      priority: priorityVariable,
      search: searchVariable,
    },
  })

  const applySearchFilters = useCallback((filters: TaskSearchFilters) => {
    if (filters.status && ['all', 'pending', 'completed'].includes(filters.status)) {
      setActiveFilter(filters.status as TaskStatusFilter)
    } else {
      setActiveFilter('all')
    }

    if (filters.priority && ['low', 'medium', 'high'].includes(filters.priority)) {
      setPriorityFilter(filters.priority as TaskPriorityFilter)
    } else {
      setPriorityFilter('all')
    }

    setSearchText(filters.search ?? '')
  }, [])

  const clearSearch = useCallback(() => {
    setSearchText('')
    setActiveFilter('all')
    setPriorityFilter('all')
  }, [])

  return {
    tasks: data?.tasks ?? [],
    loading,
    error,
    refetch,
    activeFilter,
    setActiveFilter,
    priorityFilter,
    setPriorityFilter,
    searchText,
    setSearchText,
    applySearchFilters,
    clearSearch,
  }
}
