# frozen_string_literal: true

module Ai
  class ResponseValidator
    VALID_PRIORITIES = Task::PRIORITIES
    VALID_STATUSES = %w[all pending completed].freeze
    VALID_ACTIONS = %w[search create delete complete].freeze
    MAX_TEXT_LENGTH = 200

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

    def self.validate_task_command(payload)
      return fallback_task_command if payload.blank?

      data = payload.is_a?(Hash) ? payload : {}
      action = normalize_action(data["action"] || data[:action])
      status = normalize_nullable_enum(data["status"] || data[:status], VALID_STATUSES)
      priority = normalize_nullable_enum(data["priority"] || data[:priority], VALID_PRIORITIES)
      search = sanitize_search(data["search"] || data[:search])
      title = sanitize_text(data["title"] || data[:title])
      description = sanitize_text(data["description"] || data[:description])

      {
        action: action,
        status: status,
        priority: priority,
        search: search,
        title: title,
        description: description
      }
    end

    def self.fallback_task_command
      {
        action: "search",
        status: nil,
        priority: nil,
        search: nil,
        title: nil,
        description: nil
      }
    end

    def self.sanitize_search(value)
      sanitize_text(value)
    end

    def self.sanitize_text(value)
      return nil if value.nil?

      cleaned = value.to_s.gsub(/<[^>]*>/, "").strip
      return nil if cleaned.blank?

      cleaned[0, MAX_TEXT_LENGTH]
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

    def self.normalize_action(value)
      normalized = value.to_s.downcase.strip
      VALID_ACTIONS.include?(normalized) ? normalized : "search"
    end
  end
end
