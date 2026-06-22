import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String, $priority: TaskPriorityEnum) {
    createTask(input: { title: $title, description: $description, priority: $priority }) {
      task {
        id
        title
        description
        completed
        priority
        createdAt
        updatedAt
      }
      errors
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $priority: TaskPriorityEnum) {
    updateTask(input: { id: $id, title: $title, description: $description, priority: $priority }) {
      task {
        id
        title
        description
        completed
        priority
        createdAt
        updatedAt
      }
      errors
    }
  }
`

export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: ID!) {
    completeTask(input: { id: $id }) {
      task {
        id
        completed
      }
      errors
    }
  }
`

export const REOPEN_TASK = gql`
  mutation ReopenTask($id: ID!) {
    reopenTask(input: { id: $id }) {
      task {
        id
        completed
      }
      errors
    }
  }
`

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(input: { id: $id }) {
      task {
        id
      }
      errors
    }
  }
`
