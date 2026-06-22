# frozen_string_literal: true

module Ai
  class TaskCommandParser
    def self.call(query:)
      sanitized = Ai::ResponseValidator.sanitize_text(query)
      return Ai::ResponseValidator.fallback_task_command if sanitized.blank?
      return Ai::ResponseValidator.text_search_fallback(sanitized) unless AiService.enabled?

      Ai::LlmClient.parse_task_command(query: sanitized)
    rescue Ai::LlmClient::ParseError => e
      Rails.logger.warn("[TaskCommandParser] #{e.message}")
      Ai::ResponseValidator.ai_error_command(
        "Could not interpret your command. Please try rephrasing or check the AI configuration."
      )
    end
  end
end
