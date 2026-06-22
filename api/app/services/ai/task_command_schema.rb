# frozen_string_literal: true

module Ai
  class TaskCommandSchema < RubyLLM::Schema
    string :action,
           enum: %w[search create delete complete],
           description: "Assistant action to perform"

    array :targets,
          of: :string,
          required: false,
          description: "Task titles for create, or keywords to match tasks for search/complete/delete"

    any_of :status, required: false do
      string enum: %w[all pending completed]
      null
    end

    any_of :priority, required: false do
      string enum: %w[low medium high]
      null
    end

    any_of :description, required: false do
      string description: "Optional task description for create actions"
      null
    end
  end
end
