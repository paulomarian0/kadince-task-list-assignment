require "test_helper"

class ParseTaskSearchQueryTest < ActiveSupport::TestCase
  test "returns parsed filters from graphql query" do
    with_singleton_stub(AiService, :parse_task_search, { status: "pending", priority: "high", search: "auth" }) do
      query = <<~GRAPHQL
        query {
          parseTaskSearch(query: "show high priority auth tasks") {
            status
            priority
            search
          }
        }
      GRAPHQL

      result = graphql_result(execute_graphql(query))
      filters = result.dig("data", "parseTaskSearch")

      assert_equal "pending", filters["status"]
      assert_equal "high", filters["priority"]
      assert_equal "auth", filters["search"]
    end
  end
end
