# frozen_string_literal: true

module Mutations
  class DeleteTask < BaseMutation
    description "Delete a task"

    argument :id, ID, required: true

    field :task, Types::TaskType, null: true

    def resolve(id:)
      task = Task.find_by(id: id)
      return { task: nil, errors: ["Task not found"] } unless task

      task.destroy!
      { task: task, errors: [] }
    end
  end
end
