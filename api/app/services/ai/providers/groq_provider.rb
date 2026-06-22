# frozen_string_literal: true

module Ai
  module Providers
    class GroqProvider < BaseProvider
      API_URL = "https://api.groq.com/openai/v1/chat/completions"
      TIMEOUT_SECONDS = 10

      def initialize(api_key: Rails.application.config.groq_api_key, model: Rails.application.config.groq_model)
        @api_key = api_key
        @model = model
      end

      def chat(system_prompt:, user_content:)
        return nil if @api_key.blank?

        response = connection.post do |request|
          request.body = {
            model: @model,
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system_prompt },
              { role: "user", content: user_content }
            ]
          }.to_json
        end

        return nil unless response.success?

        body = JSON.parse(response.body)
        body.dig("choices", 0, "message", "content")
      rescue Faraday::Error, JSON::ParserError, StandardError => e
        Rails.logger.warn("[GroqProvider] #{e.class}: #{e.message}")
        nil
      end

      private

      def connection
        Faraday.new(url: API_URL, request: { timeout: TIMEOUT_SECONDS }) do |faraday|
          faraday.headers["Authorization"] = "Bearer #{@api_key}"
          faraday.headers["Content-Type"] = "application/json"
          faraday.adapter Faraday.default_adapter
        end
      end
    end
  end
end
