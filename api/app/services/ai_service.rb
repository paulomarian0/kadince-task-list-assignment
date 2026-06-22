# frozen_string_literal: true

class AiService
  class << self
    def enabled?
      provider_configured?
    end

    def infer_task_priority(title:, description: "")
      Ai::TaskPriorityInferrer.call(title: title, description: description)
    end

    def parse_task_command(query:)
      Ai::TaskCommandParser.call(query: query)
    end

    def execute_task_assistant(query:)
      TaskAssistantService.call(query: query)
    end

    private

    def provider_configured?
      Rails.application.config.groq_api_key.present?
    end
  end
end
