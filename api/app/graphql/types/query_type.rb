# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :tasks, [Types::TaskType], null: false do
      argument :status, String, required: false
    end

    def tasks(status: nil)
      scope = Task.order(created_at: :desc)

      case status&.downcase
      when nil, "", "all"
        scope
      when "pending"
        scope.pending
      when "completed"
        scope.completed
      else
        raise GraphQL::ExecutionError, "Invalid status filter: #{status}. Use all, pending, or completed."
      end
    end
  end
end
