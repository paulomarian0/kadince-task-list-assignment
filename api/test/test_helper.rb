ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    parallelize(workers: :number_of_processors)
    fixtures :all

    def execute_graphql(query, variables: {}, context: {})
      ApiSchema.execute(query, variables: variables, context: context)
    end

    def graphql_result(response)
      response.to_h
    end
  end
end
