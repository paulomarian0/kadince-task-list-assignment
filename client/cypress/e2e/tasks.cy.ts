const uniqueTitle = (label: string) => `${label} ${Date.now()}`

const createTask = (title: string, description = '') => {
  cy.get('[data-testid="create-task-title"]').clear().type(title)
  if (description) {
    cy.get('[data-testid="create-task-description"]').clear().type(description)
  }
  cy.intercept('POST', '**/graphql').as('createTaskMutation')
  cy.get('[data-testid="create-task-submit"]').click()
  cy.wait('@createTaskMutation')
  cy.contains('[data-testid="task-title"]', title, { timeout: 10000 }).should('be.visible')
}

describe('Task Management', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-testid="loading-state"]', { timeout: 10000 }).should('not.exist')
    cy.get('[data-testid="filter-all"]').click()
  })

  it('creates a task and shows it in the list', () => {
    const title = uniqueTitle('New Cypress Task')
    createTask(title, 'Created from Cypress')
  })

  it('edits a task title and description', () => {
    const title = uniqueTitle('Editable Task')
    const updatedTitle = `${title} Updated`

    createTask(title, 'Original description')

    cy.contains('[data-testid="task-item"]', title).within(() => {
      cy.get('[data-testid="edit-task"]').click()
    })

    cy.get('[data-testid="edit-task-title"]').clear().type(updatedTitle)
    cy.get('[data-testid="edit-task-description"]').clear().type('Updated description')
    cy.intercept('POST', '**/graphql').as('updateTaskMutation')
    cy.get('[data-testid="edit-task-submit"]').click()
    cy.wait('@updateTaskMutation')

    cy.contains('[data-testid="task-title"]', updatedTitle, { timeout: 10000 }).should('be.visible')
    cy.contains('[data-testid="task-description"]', 'Updated description').should('be.visible')
  })

  it('completes a task and filters by pending/completed', () => {
    const title = uniqueTitle('Completable Task')
    createTask(title)

    cy.contains('[data-testid="task-item"]', title).within(() => {
      cy.intercept('POST', '**/graphql').as('completeTaskMutation')
      cy.get('[data-testid="complete-task"]').click()
      cy.wait('@completeTaskMutation')
    })

    cy.get('[data-testid="filter-pending"]').click()
    cy.contains('[data-testid="task-title"]', title).should('not.exist')

    cy.get('[data-testid="filter-completed"]').click()
    cy.contains('[data-testid="task-title"]', title, { timeout: 10000 }).should('be.visible')
  })

  it('reopens a completed task', () => {
    const title = uniqueTitle('Reopen Task')
    createTask(title)

    cy.contains('[data-testid="task-item"]', title).within(() => {
      cy.intercept('POST', '**/graphql').as('completeTaskMutation')
      cy.get('[data-testid="complete-task"]').click()
      cy.wait('@completeTaskMutation')
    })

    cy.get('[data-testid="filter-completed"]').click()
    cy.contains('[data-testid="task-item"]', title, { timeout: 10000 }).within(() => {
      cy.intercept('POST', '**/graphql').as('reopenTaskMutation')
      cy.get('[data-testid="reopen-task"]').click()
      cy.wait('@reopenTaskMutation')
    })

    cy.get('[data-testid="filter-pending"]').click()
    cy.contains('[data-testid="task-title"]', title, { timeout: 10000 }).should('be.visible')
  })

  it('deletes a task', () => {
    const title = uniqueTitle('Delete Task')
    createTask(title)

    cy.contains('[data-testid="task-item"]', title).within(() => {
      cy.intercept('POST', '**/graphql').as('deleteTaskMutation')
      cy.get('[data-testid="delete-task"]').click()
      cy.wait('@deleteTaskMutation')
    })

    cy.contains('[data-testid="task-title"]', title).should('not.exist')
  })

  it('shows tasks for all, pending, and completed filters', () => {
    cy.get('[data-testid="filter-all"]').click()
    cy.get('[data-testid="task-list"]').should('exist')

    cy.get('[data-testid="filter-pending"]').click()
    cy.get('[data-testid="task-list"]').find('[data-testid="task-status"]').each(($status) => {
      cy.wrap($status).should('contain.text', 'Pending')
    })

    cy.get('[data-testid="filter-completed"]').click()
    cy.get('[data-testid="task-list"]').find('[data-testid="task-status"]').each(($status) => {
      cy.wrap($status).should('contain.text', 'Completed')
    })
  })

  it('filters tasks by priority', () => {
    cy.get('[data-testid="filter-priority-high"]').click()
    cy.get('[data-testid="task-list"]').find('[data-testid="task-priority"]').each(($priority) => {
      cy.wrap($priority).should('contain.text', 'High Priority')
    })
  })

  it('searches tasks with natural language input', () => {
    cy.get('[data-testid="nl-search-input"]').type('authentication')
    cy.intercept('POST', '**/graphql').as('nlSearch')
    cy.get('[data-testid="nl-search-submit"]').click()
    cy.wait('@nlSearch')

    cy.get('[data-testid="task-list"]').within(() => {
      cy.contains('[data-testid="task-title"]', /authentication/i).should('be.visible')
    })
  })
})
