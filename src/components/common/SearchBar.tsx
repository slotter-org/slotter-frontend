import React from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useSearch } from '@/contexts/SearchProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SearchBar() {
  const { searchTerm, setSearchTerm, clearSearch } = useSearch()
  return (
    <div className="relative flex items-center">
      <Input
        type="text"
        placeholder="Search..."
        className="pr-8"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm !== "" && (
        <Button
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          onClick={clearSearch}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </div>
  )
}
