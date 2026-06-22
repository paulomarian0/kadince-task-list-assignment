require "test_helper"

class CompleteTaskMutationTest < ActiveSupport::TestCase
  test "marks a task as completed" do
    task = tasks(:pending_one)

    query = <<~GRAPHQL
      mutation {
        completeTask(input: { id: "#{task.id}" }) {
          task {
            id
            completed
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "completeTask")

    assert_empty data["errors"]
    assert_equal true, data["task"]["completed"]
    assert task.reload.completed
  end
end
