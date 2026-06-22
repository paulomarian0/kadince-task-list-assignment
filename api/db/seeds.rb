[
  { title: "Set up project repository", description: "Initialize repo and Docker configuration", completed: true },
  { title: "Implement GraphQL API", description: "Add queries and mutations for task management", completed: false },
  { title: "Build React frontend", description: "Connect Apollo Client and build task UI", completed: false },
  { title: "Write tests", description: "Add Minitest and Cypress coverage", completed: false },
  { title: "Document setup", description: "Write README with developer workflow", completed: false }
].each do |attrs|
  Task.find_or_create_by!(title: attrs[:title]) do |task|
    task.description = attrs[:description]
    task.completed = attrs[:completed]
  end
end
