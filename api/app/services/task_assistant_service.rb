# frozen_string_literal: true

class TaskAssistantService
  def self.call(query:)
    new(query: query).call
  end

  def initialize(query:)
    @query = query
  end

  def call
    sanitized = Ai::ResponseValidator.sanitize_text(@query)
    return error_result("Query cannot be blank") if sanitized.blank?

    command = parse_command(sanitized)
    return error_result(command[:error_message], action: "search") if command[:action] == "error"

    execute(command)
  end

  private

  def parse_command(sanitized)
    AiService.parse_task_command(query: sanitized)
  end

  def execute(command)
    case command[:action]
    when "create"
      execute_create(command)
    when "delete"
      execute_delete(command)
    when "complete"
      execute_complete(command)
    else
      execute_search(command)
    end
  end

  def execute_search(command)
    tasks = filtered_tasks(command)
    {
      action: "search",
      message: search_message(tasks.size),
      tasks: tasks,
      filters: filter_payload(command),
      errors: []
    }
  end

  def execute_create(command)
    targets = command[:targets]
    return error_result("At least one task title is required to create tasks", action: "create") if targets.empty?

    description = command[:description].to_s
    created_tasks = []
    errors = []

    Task.transaction do
      targets.each do |title|
        priority = command[:priority] || AiService.infer_task_priority(title: title, description: description)
        task = Task.new(
          title: title,
          description: description,
          completed: false,
          priority: priority
        )

        if task.save
          created_tasks << task
        else
          errors.concat(task.errors.full_messages)
        end
      end

      raise ActiveRecord::Rollback if errors.any? && created_tasks.empty?
    end

    if created_tasks.any?
      {
        action: "create",
        message: create_message(created_tasks),
        tasks: created_tasks,
        filters: nil,
        errors: errors
      }
    else
      {
        action: "create",
        message: "",
        tasks: [],
        filters: nil,
        errors: errors.presence || ["Failed to create tasks"]
      }
    end
  end

  def execute_delete(command)
    tasks = filtered_tasks(command)
    return empty_action_result("delete", "No matching tasks found to delete.") if tasks.empty?

    titles = tasks.map(&:title)
    Task.transaction { tasks.each(&:destroy!) }

    {
      action: "delete",
      message: "Deleted #{tasks.size} task(s): #{titles.join(', ')}.",
      tasks: tasks,
      filters: nil,
      errors: []
    }
  end

  def execute_complete(command)
    tasks = filtered_tasks(command).select { |task| !task.completed? }
    return empty_action_result("complete", "No matching pending tasks found to complete.") if tasks.empty?

    titles = tasks.map(&:title)
    Task.transaction { tasks.each(&:complete!) }

    {
      action: "complete",
      message: "Completed #{tasks.size} task(s): #{titles.join(', ')}.",
      tasks: tasks,
      filters: nil,
      errors: []
    }
  rescue ActiveRecord::RecordInvalid => e
    {
      action: "complete",
      message: "",
      tasks: [],
      filters: nil,
      errors: e.record.errors.full_messages
    }
  end

  def filtered_tasks(command)
    targets = command[:targets]
    scope = base_filtered_scope(command)

    return scope.to_a if targets.empty?

    if targets.size == 1
      return scope.search_text(targets.first).to_a
    end

    targets.flat_map { |term| scope.search_text(term).to_a }.uniq(&:id)
  end

  def base_filtered_scope(command)
    TaskFilterService.call(
      status: command[:status],
      priority: command[:priority],
      search: nil
    )
  end

  def filter_payload(command)
    {
      status: command[:status],
      priority: command[:priority],
      search: command[:targets]&.first
    }
  end

  def search_message(count)
    return "No tasks matched your search." if count.zero?

    "Found #{count} matching task#{'s' unless count == 1}."
  end

  def create_message(tasks)
    titles = tasks.map(&:title)
    return "Created task \"#{titles.first}\"." if titles.size == 1

    "Created #{titles.size} tasks: #{titles.join(', ')}."
  end

  def empty_action_result(action, message)
    {
      action: action,
      message: message,
      tasks: [],
      filters: nil,
      errors: []
    }
  end

  def error_result(message, action: "search")
    {
      action: action,
      message: "",
      tasks: [],
      filters: nil,
      errors: [message]
    }
  end
end
