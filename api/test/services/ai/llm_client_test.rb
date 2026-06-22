require "test_helper"

class LlmClientTest < ActiveSupport::TestCase
  class StubResponse
    attr_reader :content

    def initialize(content)
      @content = content
    end
  end

  class StubChat
    def initialize(response_content)
      @response_content = response_content
    end

    def with_instructions(_instructions)
      self
    end

    def with_params(_params)
      self
    end

    def ask(_message)
      StubResponse.new(@response_content)
    end
  end

  test "parse_task_command validates structured llm response" do
    stub_chat = StubChat.new(
      {
        "action" => "create",
        "targets" => ["Buy keyboard", "Go to gym"],
        "status" => nil,
        "priority" => nil,
        "description" => nil
      }
    )

    with_singleton_stub(RubyLLM, :chat, stub_chat) do
      result = Ai::LlmClient.parse_task_command(
        query: "create tasks: buy keyboard and go to gym"
      )

      assert_equal "create", result[:action]
      assert_equal ["Buy keyboard", "Go to gym"], result[:targets]
    end
  end

  test "infer_task_priority validates structured llm response" do
    stub_chat = StubChat.new({ "priority" => "high" })

    with_singleton_stub(RubyLLM, :chat, stub_chat) do
      result = Ai::LlmClient.infer_task_priority(title: "Fix auth bug", description: "Critical")

      assert_equal "high", result
    end
  end
end
