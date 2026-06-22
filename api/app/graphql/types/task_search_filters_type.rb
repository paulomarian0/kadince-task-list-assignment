# frozen_string_literal: true

module Types
  class TaskSearchFiltersType < Types::BaseObject
    field :status, String, null: true
    field :priority, String, null: true
    field :search, String, null: true
  end
end
