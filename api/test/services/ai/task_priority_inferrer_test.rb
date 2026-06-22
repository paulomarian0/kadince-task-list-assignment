require "test_helper"

class TaskPriorityInferrerTest < ActiveSupport::TestCase
  class StubProvider
    def initialize(response)
      @response = response
    end

    def chat(system_prompt:, user_content:)
      @response
    end
  end

  test "returns validated priority from provider response" do
    provider = StubProvider.new('{"priority":"high"}')
    result = Ai::TaskPriorityInferrer.call(
      title: "Fix auth bug",
      description: "Critical security issue",
      provider: provider
    )

    assert_equal "high", result
  end

  test "falls back to medium for invalid provider response" do
    provider = StubProvider.new('{"priority":"urgent"}')
    result = Ai::TaskPriorityInferrer.call(
      title: "Task",
      description: "Desc",
      provider: provider
    )

    assert_equal "medium", result
  end
end
