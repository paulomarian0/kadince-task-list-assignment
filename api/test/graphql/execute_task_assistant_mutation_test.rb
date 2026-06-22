require "test_helper"

class ExecuteTaskAssistantMutationTest < ActiveSupport::TestCase
  test "executes assistant command via graphql mutation" do
    with_singleton_stub(AiService, :execute_task_assistant, {
      action: "search",
      message: "Found 1 matching task.",
      tasks: [tasks(:auth_task)],
      filters: { status: "pending", priority: "high", search: "auth" },
      errors: []
    }) do
      mutation = <<~GRAPHQL
        mutation {
          executeTaskAssistant(input: { query: "show pending high auth tasks" }) {
            action
            message
            filters {
              status
              priority
              search
            }
            tasks {
              id
              title
            }
            errors
          }
        }
      GRAPHQL

      result = graphql_result(execute_graphql(mutation))
      payload = result.dig("data", "executeTaskAssistant")

      assert_equal "search", payload["action"]
      assert_equal "Found 1 matching task.", payload["message"]
      assert_equal "pending", payload.dig("filters", "status")
      assert_equal "high", payload.dig("filters", "priority")
      assert_equal "auth", payload.dig("filters", "search")
      assert_equal tasks(:auth_task).title, payload.dig("tasks", 0, "title")
      assert_empty payload["errors"]
    end
  end
end
