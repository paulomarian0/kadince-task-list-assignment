# frozen_string_literal: true

Rails.application.configure do
  config.ai_provider = ENV.fetch("AI_PROVIDER", "groq")
  config.groq_api_key = ENV["GROQ_API_KEY"]
  config.groq_model = ENV.fetch("GROQ_MODEL", "llama-3.3-70b-versatile")
end
