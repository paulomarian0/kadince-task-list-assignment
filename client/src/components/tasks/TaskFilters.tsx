import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TaskStatusFilter } from '@/types/task'

interface TaskFiltersProps {
  activeFilter: TaskStatusFilter
  onFilterChange: (filter: TaskStatusFilter) => void
}

const filters: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
]

export function TaskFilters({ activeFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <Tabs
      value={activeFilter}
      onValueChange={(value) => onFilterChange(value as TaskStatusFilter)}
      className="mb-6"
    >
      <TabsList role="tablist" aria-label="Task filters">
        {filters.map(({ value, label }) => (
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
  )
}
