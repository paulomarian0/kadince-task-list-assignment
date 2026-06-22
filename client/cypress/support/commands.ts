const GRAPHQL_URL = 'http://localhost:3000/graphql'

const LEGACY_CYPRESS_TITLE =
  /^(New Cypress Task|Editable Task|Completable Task|Reopen Task|Delete Task) \d+$/

function isTestTaskTitle(title: string): boolean {
  return title.startsWith('[cypress]') || LEGACY_CYPRESS_TITLE.test(title)
}

function graphqlRequest<T>(query: string, variables?: Record<string, unknown>) {
  return cy.request<T>({
    method: 'POST',
    url: GRAPHQL_URL,
    body: { query, variables },
    failOnStatusCode: false,
  })
}

Cypress.Commands.add('cleanupTestTasks', () => {
  graphqlRequest<{ data?: { tasks: { id: string; title: string }[] } }>(
    '{ tasks { id title } }',
  ).then((response) => {
    const testTasks = (response.body.data?.tasks ?? []).filter((task) =>
      isTestTaskTitle(task.title),
    )

    testTasks.forEach((task) => {
      graphqlRequest(
        `mutation DeleteTask($id: ID!) {
          deleteTask(input: { id: $id }) { task { id } errors }
        }`,
        { id: task.id },
      )
    })
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      cleanupTestTasks(): Chainable<void>
    }
  }
}

export {}
