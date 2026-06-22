# frozen_string_literal: true

require "ruby_llm"
require "ruby_llm/schema"

RubyLLM.configure do |config|  config.openai_api_key = Rails.application.config.groq_api_key
  config.openai_api_base = "https://api.groq.com/openai/v1"
  config.openai_use_system_role = true
  config.request_timeout = 10
  config.logger = Rails.logger
end
