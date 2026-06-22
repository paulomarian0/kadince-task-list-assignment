require "test_helper"

class TaskCommandParserTest < ActiveSupport::TestCase
  class StubProvider
    def initialize(response)
      @response = response
    end

    def chat(system_prompt:, user_content:)
      @response
    end
  end

  test "parses create command from provider response" do
    provider = StubProvider.new(
      '{"action":"create","title":"Fix login bug","description":"OAuth redirect issue","priority":"high","status":null,"search":null}'
    )

    result = Ai::TaskCommandParser.call(query: "create a high priority task fix login bug", provider: provider)

    assert_equal "create", result[:action]
    assert_equal "Fix login bug", result[:title]
    assert_equal "OAuth redirect issue", result[:description]
    assert_equal "high", result[:priority]
  end

  test "parses complete command from provider response" do
    provider = StubProvider.new(
      '{"action":"complete","search":"authentication","status":null,"priority":null,"title":null,"description":null}'
    )

    result = Ai::TaskCommandParser.call(query: "mark authentication task as done", provider: provider)

    assert_equal "complete", result[:action]
    assert_equal "authentication", result[:search]
  end

  test "falls back to rule-based create parsing without provider" do
    result = Ai::TaskCommandParser.call(query: "create task Deploy staging")

    assert_equal "create", result[:action]
    assert_equal "Deploy staging", result[:title]
  end

  test "falls back to search when provider fails" do
    provider = StubProvider.new(nil)
    result = Ai::TaskCommandParser.call(query: "authentication tasks", provider: provider)

    assert_equal "search", result[:action]
    assert_equal "authentication tasks", result[:search]
  end
end
