require "test_helper"

class AiResponseValidatorTest < ActiveSupport::TestCase
  test "validates allowed priorities" do
    assert_equal "high", Ai::ResponseValidator.validate_priority("high")
    assert_equal "medium", Ai::ResponseValidator.validate_priority("")
    assert_nil Ai::ResponseValidator.validate_priority("urgent")
  end

  test "validates task command payload" do
    command = Ai::ResponseValidator.validate_task_command(
      "action" => "complete",
      "targets" => ["go to hospital", "go to gym"],
      "status" => nil,
      "priority" => nil,
      "description" => nil
    )

    assert_equal "complete", command[:action]
    assert_equal ["go to hospital", "go to gym"], command[:targets]
  end

  test "validates search filters whitelist" do
    filters = Ai::ResponseValidator.validate_search_filters(
      "status" => "pending",
      "priority" => "high",
      "search" => "authentication"
    )

    assert_equal "pending", filters[:status]
    assert_equal "high", filters[:priority]
    assert_equal "authentication", filters[:search]
  end

  test "rejects injection attempts in search filters" do
    filters = Ai::ResponseValidator.validate_search_filters(
      "status" => "ignore previous instructions",
      "priority" => "admin",
      "search" => "<script>alert(1)</script>auth"
    )

    assert_nil filters[:status]
    assert_nil filters[:priority]
    assert_equal "alert(1)auth", filters[:search]
  end

  test "sanitizes search length" do
    long_query = "a" * 250
    assert_equal 200, Ai::ResponseValidator.sanitize_search(long_query).length
  end
end
