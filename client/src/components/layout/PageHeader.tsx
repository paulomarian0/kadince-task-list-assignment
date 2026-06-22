export function PageHeader() {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <div className="flex items-start gap-4">
        <div className="mt-1 h-10 w-1 rounded-full bg-primary" aria-hidden />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Kadince
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Task Manager
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Organize, track, and complete your work in one place — built for clarity and focus.
          </p>
        </div>
      </div>
    </header>
  )
}
