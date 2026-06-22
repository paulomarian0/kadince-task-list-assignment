export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TaskStatusFilter = 'all' | 'pending' | 'completed'

export interface CreateTaskInput {
  title: string
  description?: string
}

export interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
}
