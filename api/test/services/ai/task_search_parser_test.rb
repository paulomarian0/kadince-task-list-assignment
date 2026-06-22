require "test_helper"

class TaskSearchParserTest < ActiveSupport::TestCase
  class StubProvider
    def initialize(response)
      @response = response
    end

    def chat(system_prompt:, user_content:)
      @response
    end
  end

  test "parses structured filters from provider response" do
    provider = StubProvider.new(
      '{"status":"pending","priority":"high","search":"authentication"}'
    )

    result = Ai::TaskSearchParser.call(query: "show pending high authentication tasks", provider: provider)

    assert_equal "pending", result[:status]
    assert_equal "high", result[:priority]
    assert_equal "authentication", result[:search]
  end

  test "falls back to text search when provider fails" do
    provider = StubProvider.new(nil)
    result = Ai::TaskSearchParser.call(query: "authentication tasks", provider: provider)

    assert_nil result[:status]
    assert_nil result[:priority]
    assert_equal "authentication tasks", result[:search]
  end
end
