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
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {searchKey && (
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            placeholder={searchPlaceholder}
            value={values[searchKey] ?? ''}
            onChange={(e) => onChange(searchKey, e.target.value)}
            className="pl-9 h-9 w-56"
          />
        </div>
      )}
      {filters.map((f) => (
        <Select key={f.key} value={values[f.key] ?? 'all'} onValueChange={(v) => onChange(f.key, v ?? 'all')}>
          <SelectTrigger className="h-9 w-40">
            <span className="truncate text-left">
              {getFilterLabel(f, values[f.key] ?? 'all')}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{f.placeholder}</SelectItem>
            {f.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
