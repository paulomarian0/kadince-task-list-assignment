import { useMutation } from '@apollo/client'
import { useState } from 'react'

import { EXECUTE_TASK_ASSISTANT } from '@/graphql/mutations'
import type { TaskAssistantResult, TaskSearchFilters } from '@/types/task'

interface ExecuteTaskAssistantResult {
  executeTaskAssistant: TaskAssistantResult
}

interface UseTaskAssistantOptions {
  onApplyFilters: (filters: TaskSearchFilters) => void
  refetch: () => void
}

export function useTaskAssistant({ onApplyFilters, refetch }: UseTaskAssistantOptions) {
  const [assistantError, setAssistantError] = useState<string | null>(null)
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null)
  const [executeTaskAssistant, { loading }] = useMutation<ExecuteTaskAssistantResult>(
    EXECUTE_TASK_ASSISTANT,
  )

  const runCommand = async (query: string) => {
    setAssistantError(null)
    setAssistantMessage(null)

    const trimmed = query.trim()
    if (!trimmed) return

    try {
      const result = await executeTaskAssistant({ variables: { query: trimmed } })
      if (result.errors?.length) {
        setAssistantError(result.errors.map((error) => error.message).join(', '))
        return
      }

      const payload = result.data?.executeTaskAssistant
      if (!payload) return

      if (payload.errors.length > 0) {
        setAssistantError(payload.errors.join(', '))
        return
      }

      setAssistantMessage(payload.message)

      if (payload.filters) {
        onApplyFilters(payload.filters)
      } else {
        await refetch()
      }
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : 'Assistant command failed')
    }
  }

  return {
    runCommand,
    running: loading,
    assistantError,
    assistantMessage,
    clearAssistant: () => {
      setAssistantError(null)
      setAssistantMessage(null)
    },
  }
}
