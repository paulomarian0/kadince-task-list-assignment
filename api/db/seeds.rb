[
  { title: "Set up project repository", description: "Initialize repo and Docker configuration", completed: true, priority: "low" },
  { title: "Implement GraphQL API", description: "Add queries and mutations for task management", completed: false, priority: "high" },
  { title: "Build React frontend", description: "Connect Apollo Client and build task UI", completed: false, priority: "medium" },
  { title: "Write tests", description: "Add Minitest and Cypress coverage", completed: false, priority: "medium" },
  { title: "Document setup", description: "Write README with developer workflow", completed: false, priority: "low" },
  { title: "Fix authentication bug", description: "Resolve login session timeout issue", completed: false, priority: "high" }
].each do |attrs|
  Task.find_or_create_by!(title: attrs[:title]) do |task|
    task.description = attrs[:description]
    task.completed = attrs[:completed]
    task.priority = attrs[:priority]
  end
end
