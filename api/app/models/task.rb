class Task < ApplicationRecord
  PRIORITIES = %w[low medium high].freeze

  validates :title, presence: true
  validates :priority, inclusion: { in: PRIORITIES }

  scope :pending, -> { where(completed: false) }
  scope :completed, -> { where(completed: true) }
  scope :by_priority, ->(priority) { where(priority: priority) if priority.present? }
  scope :search_text, lambda { |query|
    if query.present?
      sanitized = sanitize_sql_like(query.to_s)
      where("title ILIKE :q OR description ILIKE :q", q: "%#{sanitized}%")
    end
  }

  def complete!
    update!(completed: true)
  end

  def reopen!
    update!(completed: false)
  end
end
