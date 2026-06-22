export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskPriorityFilter = 'all' | 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TaskPriority
  createdAt: string
  updatedAt: string
}

export type TaskStatusFilter = 'all' | 'pending' | 'completed'

export interface TaskSearchFilters {
  status: string | null
  priority: string | null
  search: string | null
}

export type TaskAssistantAction = 'search' | 'create' | 'delete' | 'complete'

export interface TaskAssistantResult {
  action: TaskAssistantAction
  message: string
  tasks: Task[]
  filters: TaskSearchFilters | null
  errors: string[]
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
}

export interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  priority?: TaskPriority
}

export function normalizePriority(priority: string): 'low' | 'medium' | 'high' {
  return priority.toLowerCase() as 'low' | 'medium' | 'high'
}

export function priorityLabel(priority: string): string {
  const normalized = normalizePriority(priority)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}
