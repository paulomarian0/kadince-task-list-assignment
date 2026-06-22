import { Search } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface NaturalLanguageSearchProps {
  onSearch: (query: string) => Promise<void>
  onClear: () => void
  isSearching?: boolean
  error?: string | null
}

export function NaturalLanguageSearch({
  onSearch,
  onClear,
  isSearching,
  error,
}: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSearch(query)
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">AI Search</CardTitle>
        <CardDescription>
          Try: &quot;show me high priority authentication tasks&quot;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <Input
            data-testid="nl-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Describe what you're looking for..."
            disabled={isSearching}
          />
          <div className="flex gap-2">
            <Button type="submit" data-testid="nl-search-submit" disabled={isSearching}>
              <Search className="h-4 w-4" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button type="button" variant="outline" onClick={onClear} disabled={isSearching}>
              Clear
            </Button>
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
