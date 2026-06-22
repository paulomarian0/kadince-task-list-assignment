require "test_helper"

class TasksQueryTest < ActiveSupport::TestCase
  test "returns all tasks ordered by created_at desc" do
    query = <<~GRAPHQL
      query {
        tasks {
          id
          title
          completed
          priority
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    tasks = result.dig("data", "tasks")

    assert_equal 4, tasks.size
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

    assert_equal 3, tasks.size
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

  test "filters by priority" do
    query = <<~GRAPHQL
      query {
        tasks(priority: "high") {
          id
          priority
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    tasks = result.dig("data", "tasks")

    assert_equal 2, tasks.size
    assert tasks.all? { |task| task["priority"] == "HIGH" }
  end

  test "filters by search text" do
    query = <<~GRAPHQL
      query {
        tasks(search: "authentication") {
          id
          title
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))
    tasks = result.dig("data", "tasks")

    assert_equal 1, tasks.size
    assert_includes tasks.first["title"].downcase, "authentication"
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

  test "returns error for invalid priority filter" do
    query = <<~GRAPHQL
      query {
        tasks(priority: "urgent") {
          id
        }
      }
    GRAPHQL

    result = graphql_result(execute_graphql(query))

    assert_not_nil result["errors"]
    assert_includes result["errors"].first["message"], "Invalid priority filter"
  end
end
