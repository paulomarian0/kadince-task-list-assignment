import { gql } from '@apollo/client'

export const GET_TASKS = gql`
  query GetTasks($status: String, $search: String) {
    tasks(status: $status, search: $search) {
      id
      title
      description
      completed
      priority
      addedAt
      createdAt
      updatedAt
    }
  }
`
