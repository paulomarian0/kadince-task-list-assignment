require "test_helper"

class TaskPriorityInferrerTest < ActiveSupport::TestCase
  test "returns validated priority from llm client" do
    with_singleton_stub(AiService, :enabled?, true) do
      with_singleton_stub(Ai::LlmClient, :infer_task_priority, "high") do
        result = Ai::TaskPriorityInferrer.call(
          title: "Fix auth bug",
          description: "Critical security issue"
        )

        assert_equal "high", result
      end
    end
  end

  test "falls back to medium when ai is disabled" do
    with_singleton_stub(AiService, :enabled?, false) do
      result = Ai::TaskPriorityInferrer.call(title: "Task", description: "Desc")

      assert_equal "medium", result
    end
  end
end
