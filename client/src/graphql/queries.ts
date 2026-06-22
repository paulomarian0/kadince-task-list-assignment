import { gql } from '@apollo/client'

export const GET_TASKS = gql`
  query GetTasks($status: String) {
    tasks(status: $status) {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`
