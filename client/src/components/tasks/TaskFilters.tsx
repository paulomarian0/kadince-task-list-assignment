import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TaskPriorityFilter, TaskStatusFilter } from '@/types/task'

interface TaskFiltersProps {
  activeFilter: TaskStatusFilter
  priorityFilter: TaskPriorityFilter
  onFilterChange: (filter: TaskStatusFilter) => void
  onPriorityFilterChange: (filter: TaskPriorityFilter) => void
}

const statusFilters: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
]

const priorityFilters: { value: TaskPriorityFilter; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function TaskFilters({
  activeFilter,
  priorityFilter,
  onFilterChange,
  onPriorityFilterChange,
}: TaskFiltersProps) {
  return (
    <div className="mb-6 space-y-3">
      <Tabs
        value={activeFilter}
        onValueChange={(value) => onFilterChange(value as TaskStatusFilter)}
      >
        <TabsList role="tablist" aria-label="Task status filters">
          {statusFilters.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              role="tab"
              data-testid={`filter-${value}`}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Tabs
        value={priorityFilter}
        onValueChange={(value) => onPriorityFilterChange(value as TaskPriorityFilter)}
      >
        <TabsList role="tablist" aria-label="Task priority filters">
          {priorityFilters.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              role="tab"
              data-testid={`filter-priority-${value}`}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
