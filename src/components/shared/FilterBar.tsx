'use client'

import { SearchableSelect } from '@/components/shared/SearchableSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlassIcon as MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  key: string
  placeholder: string
  options: FilterOption[]
}

interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset: () => void
  searchKey?: string
  searchPlaceholder?: string
  className?: string
}

export function FilterBar({ filters, values, onChange, onReset, searchKey, searchPlaceholder = 'Search...', className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {searchKey && (
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            placeholder={searchPlaceholder}
            value={values[searchKey] ?? ''}
            onChange={(e) => onChange(searchKey, e.target.value)}
            className="h-9 w-64 pl-9"
          />
        </div>
      )}
      {filters.map((f) => (
        <SearchableSelect
          key={f.key}
          value={values[f.key] ?? 'all'}
          onValueChange={(v) => onChange(f.key, v)}
          placeholder={f.placeholder}
          options={[{ value: 'all', label: f.placeholder }, ...f.options]}
          className="h-9 w-48"
        />
      ))}
      <Button variant="outline" size="sm" onClick={onReset} className="h-9">
        Reset
      </Button>
    </div>
  )
}
