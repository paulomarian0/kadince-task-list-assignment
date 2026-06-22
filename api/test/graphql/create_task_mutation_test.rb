require "test_helper"

class CreateTaskMutationTest < ActiveSupport::TestCase
  test "creates a task with title and description" do
    query = <<~GRAPHQL
      mutation {
        createTask(input: { title: "New task", description: "Task description" }) {
          task {
            id
            title
            description
            completed
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "createTask")

    assert_empty data["errors"]
    assert_not_nil data["task"]["id"]
    assert_equal "New task", data["task"]["title"]
    assert_equal "Task description", data["task"]["description"]
    assert_equal false, data["task"]["completed"]
  end

  test "returns errors when title is missing" do
    query = <<~GRAPHQL
      mutation {
        createTask(input: { title: "", description: "No title" }) {
          task {
            id
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "createTask")

    assert_nil data["task"]
    assert_includes data["errors"], "Title can't be blank"
  end
end
