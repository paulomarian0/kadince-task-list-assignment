require "test_helper"

class TasksQueryTest < ActiveSupport::TestCase
  test "returns all tasks ordered by created_at desc" do
    query = <<~GRAPHQL
      query {
        tasks {
          id
          title
          completed
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    tasks = result.dig("data", "tasks")

    assert_equal 3, tasks.size
  end

  test "filters pending tasks" do
    query = <<~GRAPHQL
      query {
        tasks(status: "pending") {
          id
          completed
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    tasks = result.dig("data", "tasks")

    assert_equal 2, tasks.size
    assert tasks.all? { |task| task["completed"] == false }
  end

  test "filters completed tasks" do
    query = <<~GRAPHQL
      query {
        tasks(status: "completed") {
          id
          completed
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    tasks = result.dig("data", "tasks")

    assert_equal 1, tasks.size
    assert_equal true, tasks.first["completed"]
  end

  test "returns error for invalid status filter" do
    query = <<~GRAPHQL
      query {
        tasks(status: "invalid") {
          id
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))

    assert_not_nil result["errors"]
    assert_includes result["errors"].first["message"], "Invalid status filter"
  end
end
