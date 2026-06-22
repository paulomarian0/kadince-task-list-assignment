# frozen_string_literal: true

module Ai
  class TaskPriorityInferrer
    def self.call(title:, description: "")
      return "medium" unless AiService.enabled?

      Ai::LlmClient.infer_task_priority(title: title, description: description)
    end
  end
end
