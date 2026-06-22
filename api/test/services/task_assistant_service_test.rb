require "test_helper"

class TaskAssistantServiceTest < ActiveSupport::TestCase
  test "creates a task from a create command" do
    with_singleton_stub(AiService, :parse_task_command, {
      action: "create",
      title: "Write docs",
      description: "API guide",
      priority: "medium",
      status: nil,
      search: nil
    }) do
      result = TaskAssistantService.call(query: "create task write docs")

      assert_equal "create", result[:action]
      assert_equal "Created task \"Write docs\".", result[:message]
      assert_equal 1, result[:tasks].size
      assert_equal "Write docs", result[:tasks].first.title
      assert_empty result[:errors]
    end
  end

  test "completes matching pending tasks" do
    task = tasks(:auth_task)

    with_singleton_stub(AiService, :parse_task_command, {
      action: "complete",
      title: nil,
      description: nil,
      priority: nil,
      status: nil,
      search: "authentication"
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
      title: nil,
      description: nil,
      priority: nil,
      status: nil,
      search: "authentication"
    }) do
      result = TaskAssistantService.call(query: "delete authentication task")

      assert_equal "delete", result[:action]
      assert_includes result[:message], "Deleted 1 task"
      assert_not Task.exists?(task.id)
      assert_empty result[:errors]
    end
  end

  test "returns filters for search commands" do
    with_singleton_stub(AiService, :parse_task_command, {
      action: "search",
      title: nil,
      description: nil,
      priority: "high",
      status: "pending",
      search: "auth"
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
