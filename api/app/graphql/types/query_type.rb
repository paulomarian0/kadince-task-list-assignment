# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :tasks, [Types::TaskType], null: false do
      argument :status, String, required: false
      argument :priority, String, required: false
      argument :search, String, required: false
    end

    def tasks(status: nil, priority: nil, search: nil)
      validate_status_filter!(status)
      validate_priority_filter!(priority)

      TaskFilterService.call(status: status, priority: priority, search: search)
    end

    private

    def validate_status_filter!(status)
      return if status.blank? || status.downcase == "all"
      return if %w[pending completed].include?(status.downcase)

      raise GraphQL::ExecutionError, "Invalid status filter: #{status}. Use all, pending, or completed."
    end

    def validate_priority_filter!(priority)
      return if priority.blank? || priority.downcase == "all"
      return if Task::PRIORITIES.include?(priority.downcase)

      raise GraphQL::ExecutionError, "Invalid priority filter: #{priority}. Use all, low, medium, or high."
    end
  end
end
