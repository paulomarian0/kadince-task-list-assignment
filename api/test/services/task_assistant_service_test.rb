require "test_helper"

class TaskAssistantServiceTest < ActiveSupport::TestCase
  test "creates a task from a create command" do
    with_singleton_stub(AiService, :parse_task_command, {
      action: "create",
      targets: ["Write docs"],
      description: "API guide",
      priority: "medium",
      status: nil
    }) do
      result = TaskAssistantService.call(query: "create task write docs")

      assert_equal "create", result[:action]
      assert_equal "Created task \"Write docs\".", result[:message]
      assert_equal 1, result[:tasks].size
      assert_equal "Write docs", result[:tasks].first.title
      assert_empty result[:errors]
    end
  end

  test "completes multiple matching pending tasks" do
    hospital = Task.create!(title: "go to hospital", description: "", completed: false, priority: "medium")
    gym = Task.create!(title: "go to gym", description: "", completed: false, priority: "medium")

    with_singleton_stub(AiService, :parse_task_command, {
      action: "complete",
      targets: ["go to hospital", "go to gym"],
      description: nil,
      priority: nil,
      status: nil
    }) do
      result = TaskAssistantService.call(
        query: "i need to complete the tasks: go to hospital and go to gym"
      )

      assert_equal "complete", result[:action]
      assert_includes result[:message], "Completed 2 task"
      assert hospital.reload.completed?
      assert gym.reload.completed?
      assert_empty result[:errors]
    end
  end

  test "completes matching pending tasks" do
    task = tasks(:auth_task)

    with_singleton_stub(AiService, :parse_task_command, {
      action: "complete",
      targets: ["authentication"],
      description: nil,
      priority: nil,
      status: nil
    }) do
      result = TaskAssistantService.call(query: "complete authentication task")

      assert_equal "complete", result[:action]
      assert_includes result[:message], "Completed 1 task"
      assert task.reload.completed?
      assert_empty result[:errors]
    end
  end

  test "deletes matching tasks" do
    task = tasks(:auth_task)

    with_singleton_stub(AiService, :parse_task_command, {
      action: "delete",
      targets: ["authentication"],
      description: nil,
      priority: nil,
      status: nil
    }) do
      result = TaskAssistantService.call(query: "delete authentication task")

      assert_equal "delete", result[:action]
      assert_includes result[:message], "Deleted 1 task"
      assert_not Task.exists?(task.id)
      assert_empty result[:errors]
    end
  end

  test "creates multiple tasks from a create command" do
    targets = ["buy a new keyboard", "go to gym", "take my daughter to school"]

    with_singleton_stub(AiService, :parse_task_command, {
      action: "create",
      targets: targets,
      description: nil,
      priority: nil,
      status: nil
    }) do
      result = TaskAssistantService.call(
        query: "i need to create 3 new tasks: buy a new keyboard, go to gym and take my daughter to school"
      )

      assert_equal "create", result[:action]
      assert_equal 3, result[:tasks].size
      assert_equal targets, result[:tasks].map(&:title)
      assert_includes result[:message], "Created 3 tasks"
      assert_empty result[:errors]
    end
  end

  test "returns an error when command parsing fails" do
    with_singleton_stub(AiService, :parse_task_command, {
      action: "error",
      targets: [],
      status: nil,
      priority: nil,
      description: nil,
      error_message: "Could not interpret your command."
    }) do
      result = TaskAssistantService.call(query: "create task buy keyboard")

      assert_equal "search", result[:action]
      assert_equal ["Could not interpret your command."], result[:errors]
      assert_empty result[:message]
    end
  end

  test "returns filters for search commands" do
    with_singleton_stub(AiService, :parse_task_command, {
      action: "search",
      targets: ["auth"],
      description: nil,
      priority: "high",
      status: "pending"
    }) do
      result = TaskAssistantService.call(query: "show pending high auth tasks")

      assert_equal "search", result[:action]
      assert_equal "pending", result[:filters][:status]
      assert_equal "high", result[:filters][:priority]
      assert_equal "auth", result[:filters][:search]
      assert_empty result[:errors]
    end
  end
end
