# frozen_string_literal: true

module Ai
  class ResponseValidator
    VALID_PRIORITIES = Task::PRIORITIES
    VALID_STATUSES = %w[all pending completed].freeze
    MAX_SEARCH_LENGTH = 200

    def self.validate_priority(value)
      normalized = value.to_s.downcase.strip
      return "medium" if normalized.blank?

      VALID_PRIORITIES.include?(normalized) ? normalized : nil
    end

    def self.validate_search_filters(payload)
      return fallback_search_filters if payload.blank?

      data = payload.is_a?(Hash) ? payload : {}
      status = normalize_nullable_enum(data["status"] || data[:status], VALID_STATUSES)
      priority = normalize_nullable_enum(data["priority"] || data[:priority], VALID_PRIORITIES)
      search = sanitize_search(data["search"] || data[:search])

      {
        status: status,
        priority: priority,
        search: search
      }
    end

    def self.sanitize_search(value)
      return nil if value.nil?

      cleaned = value.to_s.gsub(/<[^>]*>/, "").strip
      return nil if cleaned.blank?

      cleaned[0, MAX_SEARCH_LENGTH]
    end

    def self.normalize_nullable_enum(value, allowed)
      return nil if value.nil?
      return nil if value.to_s.downcase.strip == "null"

      normalized = value.to_s.downcase.strip
      allowed.include?(normalized) ? normalized : nil
    end

    def self.fallback_search_filters
      { status: nil, priority: nil, search: nil }
    end
  end
end
