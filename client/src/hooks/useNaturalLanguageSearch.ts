import { useLazyQuery } from '@apollo/client'
import { useState } from 'react'

import { PARSE_TASK_SEARCH } from '@/graphql/queries'
import type { TaskSearchFilters } from '@/types/task'

interface ParseTaskSearchResult {
  parseTaskSearch: TaskSearchFilters
}

export function useNaturalLanguageSearch(
  onApply: (filters: TaskSearchFilters) => void,
) {
  const [searchError, setSearchError] = useState<string | null>(null)
  const [parseTaskSearch, { loading }] = useLazyQuery<ParseTaskSearchResult>(PARSE_TASK_SEARCH)

  const search = async (query: string) => {
    setSearchError(null)
    const trimmed = query.trim()
    if (!trimmed) return

    try {
      const result = await parseTaskSearch({ variables: { query: trimmed } })
      if (result.error) {
        setSearchError(result.error.message)
        return
      }

      if (result.data?.parseTaskSearch) {
        onApply(result.data.parseTaskSearch)
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed')
    }
  }

  return {
    search,
    searching: loading,
    searchError,
    clearSearchError: () => setSearchError(null),
  }
}
