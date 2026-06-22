# frozen_string_literal: true

module Types
  class TaskType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: false
    field :description, String, null: false
    field :completed, Boolean, null: false
    field :priority, Types::TaskPriorityEnum, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :added_at, GraphQL::Types::ISO8601DateTime, null: false

    def added_at
      object.created_at
    end
  end
end
