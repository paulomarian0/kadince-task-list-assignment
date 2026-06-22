# frozen_string_literal: true

class AiService
  class << self
    def enabled?
      provider_configured?
    end

    def infer_task_priority(title:, description: "")
      return "medium" unless enabled?

      Ai::TaskPriorityInferrer.call(
        title: title,
        description: description,
        provider: current_provider
      )
    end

    def parse_task_command(query:)
      sanitized = Ai::ResponseValidator.sanitize_search(query)
      return Ai::ResponseValidator.fallback_task_command if sanitized.blank?

      provider = enabled? ? current_provider : nil
      Ai::TaskCommandParser.call(query: sanitized, provider: provider)
    end

    def execute_task_assistant(query:)
      TaskAssistantService.call(query: query)
    end

    private

    def provider_configured?
      Rails.application.config.groq_api_key.present?
    end

    def current_provider
      case Rails.application.config.ai_provider
      when "groq"
        Ai::Providers::GroqProvider.new
      else
        raise ArgumentError, "Unsupported AI provider: #{Rails.application.config.ai_provider}"
      end
    end
  end
end
