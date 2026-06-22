# frozen_string_literal: true

module Mutations
  class ReopenTask < BaseMutation
    description "Reopen a completed task"

    argument :id, ID, required: true

    field :task, Types::TaskType, null: true

    def resolve(id:)
      task = Task.find_by(id: id)
      return { task: nil, errors: ["Task not found"] } unless task

      task.reopen!
      { task: task, errors: [] }
    rescue ActiveRecord::RecordInvalid => e
      { task: nil, errors: e.record.errors.full_messages }
    end
  end
end
