# frozen_string_literal: true

module Mutations
  class CreateTask < BaseMutation
    description "Create a new task"

    argument :title, String, required: true
    argument :description, String, required: false
    argument :priority, Types::TaskPriorityEnum, required: false

    field :task, Types::TaskType, null: true

    def resolve(title:, description: "", priority: nil)
      resolved_priority = priority || AiService.infer_task_priority(title: title, description: description)
      task = Task.new(
        title: title,
        description: description,
        completed: false,
        priority: resolved_priority
      )

      if task.save
        { task: task, errors: [] }
      else
        { task: nil, errors: self.class.build_errors(task) }
      end
    end
  end
end
