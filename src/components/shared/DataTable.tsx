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
  tableClassName?: string
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
  tableClassName,
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
    <div className={cn('w-full overflow-x-auto rounded-xl border border-border/70 bg-card [&_tbody_svg]:text-primary')}>
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow className="border-b border-border/70 bg-secondary/80 hover:bg-secondary/80">
            {showSerialNumber && (
              <TableHead className="w-14 border-r border-border/45 px-4 text-center font-semibold text-foreground last:border-r-0">
                No.
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.key} className={cn('border-r border-border/45 px-4 font-semibold text-foreground last:border-r-0', col.headerClassName ?? col.className)}>
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
                'border-b border-border/65 bg-card transition-colors last:border-0',
                striped
                  ? 'hover:bg-muted/35'
                  : 'hover:bg-muted/35'
                )}
            >
              {showSerialNumber && (
                <TableCell className="w-14 border-r border-border/35 px-4 text-center text-xs font-bold text-muted-foreground last:border-r-0">
                  {serialNumberStart + index}
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.key} className={cn('border-r border-border/35 px-4 last:border-r-0', col.className)}>
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
