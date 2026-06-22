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

    def parse_task_search(query:)
      sanitized = Ai::ResponseValidator.sanitize_search(query)
      return { status: nil, priority: nil, search: nil } if sanitized.blank?
      return { status: nil, priority: nil, search: sanitized } unless enabled?

      Ai::TaskSearchParser.call(query: sanitized, provider: current_provider)
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
