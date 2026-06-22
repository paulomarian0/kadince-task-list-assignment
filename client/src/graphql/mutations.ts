import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String) {
    createTask(input: { title: $title, description: $description }) {
      task {
        id
        title
        description
        completed
        createdAt
        updatedAt
      }
      errors
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String) {
    updateTask(input: { id: $id, title: $title, description: $description }) {
      task {
        id
        title
        description
        completed
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
