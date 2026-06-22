require "test_helper"

class CreateTaskMutationTest < ActiveSupport::TestCase
  test "creates a task with title and description" do
    with_singleton_stub(AiService, :infer_task_priority, "medium") do
      query = <<~GRAPHQL
        mutation {
          createTask(input: { title: "New task", description: "Task description" }) {
            task {
              id
              title
              description
              completed
              priority
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
      assert_equal "MEDIUM", data["task"]["priority"]
    end
  end

  test "creates a task with explicit priority" do
    query = <<~GRAPHQL
      mutation {
        createTask(input: { title: "Priority task", priority: HIGH }) {
          task {
            priority
          }
          errors
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    data = result.dig("data", "createTask")

    assert_empty data["errors"]
    assert_equal "HIGH", data["task"]["priority"]
  end

  test "infers priority when not provided" do
    with_singleton_stub(AiService, :infer_task_priority, "high") do
      query = <<~GRAPHQL
        mutation {
          createTask(input: { title: "Critical bug", description: "Production down" }) {
            task {
              priority
            }
            errors
          }
        }
      GRAPHQL

      result = graphql_result(execute_graphql(query))
      data = result.dig("data", "createTask")

      assert_empty data["errors"]
      assert_equal "HIGH", data["task"]["priority"]
    end
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
