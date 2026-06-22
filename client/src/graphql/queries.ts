import { gql } from '@apollo/client'

export const GET_TASKS = gql`
  query GetTasks($status: String, $priority: String, $search: String) {
    tasks(status: $status, priority: $priority, search: $search) {
      id
      title
      description
      completed
      priority
      createdAt
      updatedAt
    }
  }
`
