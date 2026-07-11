'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'
import { TableEmptyRow } from './TableEmptyRow'

export interface ColumnDef<T> {
  key: string
  header: string
  className?: string
  headerClassName?: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  variant?: 'default' | 'striped'
  showSerialNumber?: boolean
  serialNumberStart?: number
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription,
  variant = 'default',
  showSerialNumber = true,
  serialNumberStart = 1,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  const striped = variant === 'striped'
  const visibleColumnCount = columns.length + (showSerialNumber ? 1 : 0)

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl bg-card border [&_tbody_svg]:text-primary', striped ? 'border-border/60' : 'border-border')}>
      <Table>
        <TableHeader>
          <TableRow className={cn('hover:bg-transparent border-b', striped ? 'border-border/70 bg-muted/80' : 'border-border bg-muted/70')}>
            {showSerialNumber && (
              <TableHead className="w-14 text-center font-bold text-foreground">
                No.
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.key} className={cn('font-bold text-foreground', col.headerClassName ?? col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? data.map((row, index) => (
            <TableRow
              key={row.id}
              className={cn(
                'border-b last:border-0 transition-colors',
                striped
                  ? 'border-border/60 odd:bg-transparent even:bg-muted/25 hover:bg-muted/50'
                  : 'border-border hover:bg-muted/40'
                )}
            >
              {showSerialNumber && (
                <TableCell className="w-14 text-center text-xs font-bold text-muted-foreground">
                  {serialNumberStart + index}
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render ? col.render(row) : renderCellValue(row, col.key)}
                </TableCell>
              ))}
            </TableRow>
          )) : (
            <TableEmptyRow
              colSpan={visibleColumnCount}
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function renderCellValue<T extends { id: string }>(row: T, key: string) {
  const value = row[key as keyof T]
  if (value == null) return '-'
  const text = String(value).trim()
  return text || '-'
}
