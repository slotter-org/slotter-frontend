import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useSearch } from '@/contexts/SearchProvider'

interface SearchBarProps {
  /** if you pass `value` it uses this instead of the global `searchTerm` */
  value?: string
  /** callback for local mode */
  onChange?: (value: string) => void
  /** callback for local mode (clearing) */
  onClear?: () => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value: controlledValue,
  onChange: controlledOnChange,
  onClear: controlledOnClear,
  placeholder = 'Search…',
  className,
}: SearchBarProps) {
  const { searchTerm, setSearchTerm, clearSearch } = useSearch()

  // if controlledValue is passed, use that; otherwise fall back to global
  const value = controlledValue !== undefined ? controlledValue : searchTerm
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (controlledOnChange) controlledOnChange(v)
    else setSearchTerm(v)
  }
  const handleClear = () => {
    if (controlledOnClear) controlledOnClear()
    else clearSearch()
  }

  return (
    <div className={`relative flex items-center ${className || ''}`}>
      <Input
        type="text"
        placeholder={placeholder}
        className="pr-8"
        value={value}
        onChange={handleChange}
      />
      {value && (
        <Button
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          onClick={handleClear}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </div>
  )
}
