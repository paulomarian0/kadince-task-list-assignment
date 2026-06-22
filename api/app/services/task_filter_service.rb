# frozen_string_literal: true

class TaskFilterService
  def self.call(status: nil, priority: nil, search: nil)
    new(status: status, priority: priority, search: search).call
  end

  def initialize(status:, priority:, search:)
    @status = status
    @priority = priority
    @search = search
  end

  def call
    scope = Task.order(created_at: :desc)
    scope = apply_status_filter(scope, @status)
    scope = apply_priority_filter(scope, @priority)
    scope.search_text(@search)
  end

  private

  def apply_status_filter(scope, status)
    case status&.downcase
    when nil, "", "all"
      scope
    when "pending"
      scope.pending
    when "completed"
      scope.completed
    else
      scope
    end
  end

  def apply_priority_filter(scope, priority)
    case priority&.downcase
    when nil, "", "all"
      scope
    when *Task::PRIORITIES
      scope.by_priority(priority.downcase)
    else
      scope
    end
  end
end
