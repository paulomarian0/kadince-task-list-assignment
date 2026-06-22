# frozen_string_literal: true

class TaskAssistantService
  def self.call(query:)
    new(query: query).call
  end

  def initialize(query:)
    @query = query
  end

  def call
    sanitized = Ai::ResponseValidator.sanitize_search(@query)
    return error_result("Query cannot be blank") if sanitized.blank?

    command = parse_command(sanitized)
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
    title = command[:title]
    return error_result("Task title is required to create a task", action: "create") if title.blank?

    description = command[:description].to_s
    priority = command[:priority] || AiService.infer_task_priority(title: title, description: description)
    task = Task.new(
      title: title,
      description: description,
      completed: false,
      priority: priority
    )

    if task.save
      {
        action: "create",
        message: "Created task \"#{task.title}\".",
        tasks: [task],
        filters: nil,
        errors: []
      }
    else
      {
        action: "create",
        message: "",
        tasks: [],
        filters: nil,
        errors: task.errors.full_messages
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
    TaskFilterService.call(
      status: command[:status],
      priority: command[:priority],
      search: command[:search]
    ).to_a
  end

  def filter_payload(command)
    {
      status: command[:status],
      priority: command[:priority],
      search: command[:search]
    }
  end

  def search_message(count)
    return "No tasks matched your search." if count.zero?

    "Found #{count} matching task#{'s' unless count == 1}."
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
