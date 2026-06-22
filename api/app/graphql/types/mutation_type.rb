# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :create_task, mutation: Mutations::CreateTask
    field :update_task, mutation: Mutations::UpdateTask
    field :complete_task, mutation: Mutations::CompleteTask
    field :reopen_task, mutation: Mutations::ReopenTask
    field :delete_task, mutation: Mutations::DeleteTask
  end
end
