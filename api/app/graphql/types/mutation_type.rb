# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_task, mutation: Mutations::CreateTask
    field :update_task, mutation: Mutations::UpdateTask
    field :complete_task, mutation: Mutations::CompleteTask
    field :reopen_task, mutation: Mutations::ReopenTask
    field :delete_task, mutation: Mutations::DeleteTask
    field :execute_task_assistant, mutation: Mutations::ExecuteTaskAssistant
  end
end
