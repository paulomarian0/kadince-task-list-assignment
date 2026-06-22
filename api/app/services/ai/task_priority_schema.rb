# frozen_string_literal: true

module Ai
  class TaskPrioritySchema < RubyLLM::Schema
    string :priority,
           enum: %w[low medium high],
           description: "Inferred task priority"
  end
end
