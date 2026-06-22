# frozen_string_literal: true

class ApiSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)

  max_depth 10
  max_complexity 100
end
