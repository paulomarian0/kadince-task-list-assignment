# frozen_string_literal: true

module Ai
  module Providers
    class BaseProvider
      def chat(system_prompt:, user_content:)
        raise NotImplementedError, "#{self.class} must implement #chat"
      end
    end
  end
end
