# frozen_string_literal: true

module Mutations
  class ExecuteTaskAssistant < BaseMutation
    description "Parse natural language and search, create, delete, or complete tasks"

    argument :query, String, required: true

    field :action, String, null: false
    field :message, String, null: false
    field :tasks, [Types::TaskType], null: false
    field :filters, Types::TaskSearchFiltersType, null: true

    def resolve(query:)
      result = AiService.execute_task_assistant(query: query)

      {
        action: result[:action],
        message: result[:message],
        tasks: result[:tasks],
        filters: result[:filters],
        errors: result[:errors]
      }
    end
  end
end
