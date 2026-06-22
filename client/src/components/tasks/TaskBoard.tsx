import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTaskAssistant } from '@/hooks/useTaskAssistant'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { useTasksQuery } from '@/hooks/useTasksQuery'

import { TaskAssistant } from './TaskAssistant'
import { TaskErrorBanner } from './TaskErrorBanner'
import { TaskFilters } from './TaskFilters'
import { TaskForm } from './TaskForm'
import { TaskList } from './TaskList'
import { TaskLoadingState } from './TaskLoadingState'

export function TaskBoard() {
  const {
    tasks,
    loading,
    error,
    refetch,
    activeFilter,
    setActiveFilter,
    applySearchFilters,
    clearSearch,
  } = useTasksQuery()

  const {
    runCommand,
    running,
    assistantError,
    assistantMessage,
    clearAssistant,
  } = useTaskAssistant({
    onApplyFilters: applySearchFilters,
    refetch,
  })

  const {
    editingTask,
    setEditingTask,
    mutationError,
    clearMutationError,
    creating,
    updating,
    isBusy,
    handleCreate,
    handleUpdate,
    completeTask,
    reopenTask,
    deleteTask,
  } = useTaskMutations({ refetch })

  const showInitialLoading = loading && tasks.length === 0

  return (
    <>
      <PageHeader />

      <TaskAssistant
        onRun={runCommand}
        onClear={() => {
          clearSearch()
          clearAssistant()
        }}
        isRunning={running}
        error={assistantError}
        message={assistantMessage}
      />

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

      <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {mutationError && (
        <TaskErrorBanner
          testId="mutation-error"
          title="Action failed"
          message={mutationError}
          onDismiss={clearMutationError}
        />
      )}

      {error && (
        <TaskErrorBanner
          testId="query-error"
          title="Failed to load tasks"
          message={error.message}
          onRetry={() => refetch()}
          retryTestId="retry-load"
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {showInitialLoading ? (
            <TaskLoadingState />
          ) : (
            <TaskList
              tasks={tasks}
              loading={loading}
              onEdit={setEditingTask}
              onComplete={completeTask}
              onReopen={reopenTask}
              onDelete={deleteTask}
              isUpdating={isBusy}
            />
          )}
        </CardContent>
      </Card>
    </>
  )
}
