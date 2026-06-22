require "test_helper"

class TaskCommandParserTest < ActiveSupport::TestCase
  test "parses create command via llm client" do
    command = {
      action: "create",
      targets: ["Fix login bug"],
      description: "OAuth redirect issue",
      priority: "high",
      status: nil
    }

    with_ai_enabled do
      with_llm_command(command) do
        result = Ai::TaskCommandParser.call(query: "create a high priority task fix login bug")

        assert_equal "create", result[:action]
        assert_equal ["Fix login bug"], result[:targets]
        assert_equal "OAuth redirect issue", result[:description]
        assert_equal "high", result[:priority]
      end
    end
  end

  test "parses multiple complete targets via llm client" do
    command = {
      action: "complete",
      targets: ["go to hospital", "go to gym"],
      description: nil,
      priority: nil,
      status: nil
    }

    with_ai_enabled do
      with_llm_command(command) do
        result = Ai::TaskCommandParser.call(
          query: "i need to complete the tasks: go to hospital and go to gym"
        )

        assert_equal "complete", result[:action]
        assert_equal ["go to hospital", "go to gym"], result[:targets]
      end
    end
  end

  test "parses multiple create targets via llm client" do
    command = {
      action: "create",
      targets: ["buy a new keyboard", "go to gym", "take my daughter to school"],
      description: nil,
      priority: nil,
      status: nil
    }

    with_ai_enabled do
      with_llm_command(command) do
        result = Ai::TaskCommandParser.call(
          query: "i need to create 3 new tasks: buy a new keyboard, go to gym and take my daughter to school"
        )

        assert_equal "create", result[:action]
        assert_equal 3, result[:targets].size
      end
    end
  end

  test "falls back to text search when ai is disabled" do
    with_singleton_stub(AiService, :enabled?, false) do
      result = Ai::TaskCommandParser.call(query: "authentication tasks")

      assert_equal "search", result[:action]
      assert_equal ["authentication tasks"], result[:targets]
    end
  end

  test "returns an error command when llm parsing fails" do
    original = Ai::LlmClient.method(:parse_task_command)

    with_ai_enabled do
      Ai::LlmClient.define_singleton_method(:parse_task_command) { |**| raise Ai::LlmClient::ParseError, "boom" }

      result = Ai::TaskCommandParser.call(query: "create task buy keyboard")

      assert_equal "error", result[:action]
      assert_includes result[:error_message], "Could not interpret"
    end
  ensure
    Ai::LlmClient.define_singleton_method(:parse_task_command, original)
  end

  private

  def with_ai_enabled
    with_singleton_stub(AiService, :enabled?, true) { yield }
  end

  def with_llm_command(command)
    with_singleton_stub(Ai::LlmClient, :parse_task_command, command) { yield }
  end
end
