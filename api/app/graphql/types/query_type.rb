# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :tasks, [Types::TaskType], null: false do
      argument :status, String, required: false
      argument :priority, String, required: false
      argument :search, String, required: false
    end

    field :parse_task_search, Types::TaskSearchFiltersType, null: false do
      argument :query, String, required: true
    end

    def tasks(status: nil, priority: nil, search: nil)
      scope = Task.order(created_at: :desc)

      scope = apply_status_filter(scope, status)
      scope = apply_priority_filter(scope, priority)
      scope.search_text(search)
    end

    def parse_task_search(query:)
      AiService.parse_task_search(query: query)
    end

    private

    def apply_status_filter(scope, status)
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

    def apply_priority_filter(scope, priority)
      case priority&.downcase
      when nil, "", "all"
        scope
      when *Task::PRIORITIES
        scope.by_priority(priority.downcase)
      else
        raise GraphQL::ExecutionError, "Invalid priority filter: #{priority}. Use all, low, medium, or high."
      end
    end
  end
end
