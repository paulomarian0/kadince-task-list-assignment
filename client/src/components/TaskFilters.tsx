import type { TaskStatusFilter } from '../types/task'

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
    <div className="task-filters" role="tablist" aria-label="Task filters">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={activeFilter === value}
          data-testid={`filter-${value}`}
          className={activeFilter === value ? 'filter-btn active' : 'filter-btn'}
          onClick={() => onFilterChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
