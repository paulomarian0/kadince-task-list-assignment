import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface TaskAssistantProps {
  onRun: (query: string) => Promise<void>
  onClear: () => void
  isRunning?: boolean
  error?: string | null
  message?: string | null
}

export function TaskAssistant({
  onRun,
  onClear,
  isRunning,
  error,
  message,
}: TaskAssistantProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onRun(query)
  }

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">AI Assistant</CardTitle>
        <CardDescription>
          Search, create, complete, or delete tasks in plain language. Try: &quot;create task
          Review PR&quot;, &quot;create 3 tasks: buy keyboard, go to gym and pick up kids&quot;, or
          &quot;show high priority pending tasks&quot;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <Input
            data-testid="task-assistant-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tell the assistant what to do..."
            disabled={isRunning}
          />
          <div className="flex gap-2">
            <Button type="submit" data-testid="task-assistant-submit" disabled={isRunning}>
              <Sparkles className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear} disabled={isRunning}>
              Clear
            </Button>
          </div>
        </form>
        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
