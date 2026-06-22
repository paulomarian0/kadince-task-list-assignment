# frozen_string_literal: true

module Types
  class TaskPriorityEnum < Types::BaseEnum
    Task::PRIORITIES.each do |priority|
      value priority.upcase, value: priority
    end
  end
end
