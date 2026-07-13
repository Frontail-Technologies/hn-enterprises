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
  containerClassName?: string
  dense?: boolean
  stickyHeader?: boolean
  stickyLastColumn?: boolean
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
  containerClassName,
  dense = true,
  stickyHeader,
  stickyLastColumn,
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
    <div className={cn('w-full overflow-x-auto rounded-lg border border-border/70 bg-card [&_tbody_svg]:text-primary', containerClassName)}>
      <Table className={tableClassName}>
        <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <TableRow className="border-b border-border/70 bg-secondary/80 hover:bg-secondary/80">
            {showSerialNumber && (
              <TableHead className={cn('w-12 border-r border-border/45 px-3 text-center text-xs font-semibold text-muted-foreground last:border-r-0', dense && 'h-8')}>
                No.
              </TableHead>
            )}
            {columns.map((col, index) => (
              <TableHead
                key={col.key}
                className={cn(
                  'border-r border-border/45 px-3 text-xs font-semibold text-muted-foreground last:border-r-0',
                  dense && 'h-8',
                  stickyLastColumn && index === columns.length - 1 && 'sticky right-0 z-[1] bg-secondary/95 shadow-[-8px_0_12px_-12px_var(--foreground)]',
                  col.headerClassName ?? col.className,
                )}
              >
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
                <TableCell className={cn('w-12 border-r border-border/35 px-3 text-center text-xs font-medium text-muted-foreground last:border-r-0', dense && 'py-2')}>
                  {serialNumberStart + index}
                </TableCell>
              )}
              {columns.map((col, index) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    'border-r border-border/35 px-3 text-sm font-normal text-foreground last:border-r-0',
                    dense && 'py-2',
                    stickyLastColumn && index === columns.length - 1 && 'sticky right-0 z-[1] bg-card shadow-[-8px_0_12px_-12px_var(--foreground)]',
                    col.className,
                  )}
                >
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
