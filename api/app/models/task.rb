class Task < ApplicationRecord
  validates :title, presence: true

  scope :pending, -> { where(completed: false) }
  scope :completed, -> { where(completed: true) }

  def complete!
    update!(completed: true)
  end

  def reopen!
    update!(completed: false)
  end
end
