require "test_helper"

class ReopenTaskMutationTest < ActiveSupport::TestCase
  test "reopens a completed task" do
    task = tasks(:completed_one)

    query = <<~GRAPHQL
      mutation {
        reopenTask(input: { id: "#{task.id}" }) {
          task {
            id
            completed
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "reopenTask")

    assert_empty data["errors"]
    assert_equal false, data["task"]["completed"]
    assert_not task.reload.completed
  end
end
