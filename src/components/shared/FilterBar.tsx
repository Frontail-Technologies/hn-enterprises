'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
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
        <Select key={f.key} value={values[f.key] ?? 'all'} onValueChange={(v) => onChange(f.key, v ?? 'all')}>
          <SelectTrigger className="h-9 w-48" title={getFilterLabel(f, values[f.key] ?? 'all')}>
            <span className="min-w-0 truncate text-left">
              {getFilterLabel(f, values[f.key] ?? 'all')}
            </span>
          </SelectTrigger>
          <SelectContent className="w-72 max-w-[calc(100vw-2rem)]">
            <SelectItem value="all" title={f.placeholder}>
              <span className="block min-w-0 truncate">{f.placeholder}</span>
            </SelectItem>
            {f.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} title={opt.label}>
                <span className="block min-w-0 truncate">{opt.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      <Button variant="outline" size="sm" onClick={onReset} className="h-9">
        Reset
      </Button>
    </div>
  )
}

function getFilterLabel(filter: FilterConfig, value: string) {
  if (value === 'all') return filter.placeholder
  return filter.options.find((option) => option.value === value)?.label ?? filter.placeholder
}
