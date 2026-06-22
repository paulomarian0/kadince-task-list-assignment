# frozen_string_literal: true

module Mutations
  class UpdateTask < BaseMutation
    description "Update an existing task"

    argument :id, ID, required: true
    argument :title, String, required: false
    argument :description, String, required: false

    field :task, Types::TaskType, null: true

    def resolve(id:, title: nil, description: nil)
      task = Task.find_by(id: id)
      return { task: nil, errors: ["Task not found"] } unless task

      attributes = {}
      attributes[:title] = title unless title.nil?
      attributes[:description] = description unless description.nil?

      if task.update(attributes)
        { task: task, errors: [] }
      else
        { task: nil, errors: self.class.build_errors(task) }
      end
    end
  end
end
