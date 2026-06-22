import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNaturalLanguageSearch } from '@/hooks/useNaturalLanguageSearch'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { useTasksQuery } from '@/hooks/useTasksQuery'

import { NaturalLanguageSearch } from './NaturalLanguageSearch'
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
    priorityFilter,
    setPriorityFilter,
    applySearchFilters,
    clearSearch,
  } = useTasksQuery()

  const { search, searching, searchError, clearSearchError } = useNaturalLanguageSearch(
    applySearchFilters,
  )

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

      <NaturalLanguageSearch
        onSearch={search}
        onClear={() => {
          clearSearch()
          clearSearchError()
        }}
        isSearching={searching}
        error={searchError}
      />

      <TaskFilters
        activeFilter={activeFilter}
        priorityFilter={priorityFilter}
        onFilterChange={setActiveFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="space-y-4">
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

        <section>
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
        </section>
      </div>
    </>
  )
}
