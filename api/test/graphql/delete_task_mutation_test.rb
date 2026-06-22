require "test_helper"

class DeleteTaskMutationTest < ActiveSupport::TestCase
  test "deletes a task" do
    task = tasks(:pending_two)

    query = <<~GRAPHQL
      mutation {
        deleteTask(input: { id: "#{task.id}" }) {
          task {
            id
            title
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "deleteTask")

    assert_empty data["errors"]
    assert_equal task.id.to_s, data["task"]["id"]
    assert_not Task.exists?(task.id)
  end
end
