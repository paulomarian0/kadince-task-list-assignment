require "test_helper"

class UpdateTaskMutationTest < ActiveSupport::TestCase
  test "updates task title and description" do
    task = tasks(:pending_one)

    query = <<~GRAPHQL
      mutation {
        updateTask(input: { id: "#{task.id}", title: "Updated title", description: "Updated description" }) {
          task {
            id
            title
            description
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "updateTask")

    assert_empty data["errors"]
    assert_equal "Updated title", data["task"]["title"]
    assert_equal "Updated description", data["task"]["description"]
  end

  test "returns error when task is not found" do
    query = <<~GRAPHQL
      mutation {
        updateTask(input: { id: "999999", title: "Missing" }) {
          task {
            id
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "updateTask")

    assert_nil data["task"]
    assert_includes data["errors"], "Task not found"
  end
end
