ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    parallelize(workers: 1)
    fixtures :all

    def with_singleton_stub(klass, method_name, return_value)
      original = klass.method(method_name)
      klass.define_singleton_method(method_name) { |**| return_value }
      yield
    ensure
      klass.define_singleton_method(method_name, original)
    end

    def execute_graphql(query, variables: {}, context: {})
      ApiSchema.execute(query, variables: variables, context: context)
    end

    def graphql_result(response)
      response.to_h
    end
  end
end
