const testTitle = (label: string) => `[cypress] ${label}`

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
    cy.cleanupTestTasks()
    cy.visit('/')
    cy.get('[data-testid="loading-state"]', { timeout: 10000 }).should('not.exist')
    cy.get('[data-testid="filter-all"]').click()
  })

  afterEach(() => {
    cy.cleanupTestTasks()
  })

  it('creates a task and shows it in the list', () => {
    const title = testTitle('New Task')
    createTask(title, 'Created from Cypress')
  })

  it('edits a task title and description', () => {
    const title = testTitle('Editable Task')
    const updatedTitle = testTitle('Editable Task Updated')

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
    const title = testTitle('Completable Task')
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
    const title = testTitle('Reopen Task')
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
    const title = testTitle('Delete Task')
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

  it('uses the AI assistant to search tasks', () => {
    cy.get('[data-testid="task-assistant-input"]').type('authentication')
    cy.intercept('POST', '**/graphql').as('taskAssistant')
    cy.get('[data-testid="task-assistant-submit"]').click()
    cy.wait('@taskAssistant')

    cy.get('[data-testid="task-list"]').within(() => {
      cy.contains('[data-testid="task-title"]', /authentication/i).should('be.visible')
    })
  })
})
