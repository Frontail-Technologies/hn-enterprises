'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { TableEmptyRow } from './TableEmptyRow'
import { TableLoader } from './TableLoader'

export interface ColumnDef<T> {
  key: string
  header: string
  className?: string
  headerClassName?: string
  render?: (row: T) => React.ReactNode
}

// Opt-in row-selection support (bulk operations toolbar) - mirrors
// ExcelDataGrid's `selection` prop so both shared table primitives offer the
// same bulk-select contract. A caller that doesn't pass `selection` gets no
// checkbox column and no behavior change.
export interface DataTableSelection<T extends { id: string }> {
  selectedIds: ReadonlySet<string>
  onToggleRow: (id: string) => void
  onTogglePage: (pageIds: string[]) => void
  isRowSelectable?: (row: T) => boolean
  getRowLabel?: (row: T) => string
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
  selection?: DataTableSelection<T>
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription,
  showSerialNumber = true,
  serialNumberStart = 1,
  tableClassName,
  containerClassName,
  dense = true,
  stickyHeader,
  stickyLastColumn,
  selection,
}: DataTableProps<T>) {
  const visibleColumnCount = columns.length + (showSerialNumber ? 1 : 0) + (selection ? 1 : 0)
  const selectableIds = selection
    ? data.filter((row) => selection.isRowSelectable?.(row) ?? true).map((row) => row.id)
    : []
  const allOnPageSelected =
    Boolean(selection) && selectableIds.length > 0 && selectableIds.every((id) => selection!.selectedIds.has(id))
  const someOnPageSelected =
    Boolean(selection) && !allOnPageSelected && selectableIds.some((id) => selection!.selectedIds.has(id))

  return (
    <div className={cn('w-full overflow-x-auto rounded-card border border-border bg-card [&_tbody_svg]:text-primary', containerClassName)}>
      <Table className={cn('min-w-full', tableClassName)}>
        <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <TableRow className="border-b border-border bg-secondary hover:bg-secondary">
            {selection && (
              <TableHead className={cn('w-12 pl-3 pr-0 text-center', dense && 'h-10.5')}>
                <Checkbox
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected}
                  onCheckedChange={() => selection.onTogglePage(selectableIds)}
                  aria-label={allOnPageSelected ? 'Deselect all rows' : 'Select all rows'}
                  disabled={selectableIds.length === 0}
                />
              </TableHead>
            )}
            {showSerialNumber && (
              <TableHead className={cn('w-12 px-3 text-center text-xs font-semibold text-muted-foreground', dense && 'h-10.5')}>
                No.
              </TableHead>
            )}
            {columns.map((col, index) => (
              <TableHead
                key={col.key}
                className={cn(
                  'px-3 text-xs font-semibold text-muted-foreground',
                  dense && 'h-10.5',
                  stickyLastColumn && index === columns.length - 1 && 'sticky right-0 z-[1] bg-secondary shadow-[-8px_0_12px_-12px_var(--foreground)]',
                  col.headerClassName ?? col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableLoader colSpan={visibleColumnCount} />
          ) : data.length ? data.map((row, index) => {
            const isSelectable = selection?.isRowSelectable?.(row) ?? true
            const isRowSelected = Boolean(selection?.selectedIds.has(row.id))
            return (
            <TableRow
              key={row.id}
              className={cn(
                'border-b border-border/60 bg-card transition-colors last:border-0 hover:bg-muted/35',
                )}
            >
              {selection && (
                <TableCell className={cn('w-12 pl-3 pr-0 text-center', dense && 'py-2.5')}>
                  {isSelectable ? (
                    <Checkbox
                      checked={isRowSelected}
                      onCheckedChange={() => selection.onToggleRow(row.id)}
                      aria-label={selection.getRowLabel?.(row) ?? (isRowSelected ? 'Deselect row' : 'Select row')}
                    />
                  ) : null}
                </TableCell>
              )}
              {showSerialNumber && (
                <TableCell className={cn('w-12 px-3 text-center text-xs font-medium text-muted-foreground', dense && 'py-2.5')}>
                  {serialNumberStart + index}
                </TableCell>
              )}
              {columns.map((col, index) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    'px-3 text-sm font-normal text-foreground',
                    dense && 'py-2.5',
                    stickyLastColumn && index === columns.length - 1 && 'sticky right-0 z-[1] bg-card shadow-[-8px_0_12px_-12px_var(--foreground)]',
                    col.className,
                  )}
                >
                  {col.render ? col.render(row) : renderCellValue(row, col.key)}
                </TableCell>
              ))}
            </TableRow>
            )
          }) : (
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
  const text = value == null ? '' : String(value).trim()
  if (!text) return <span className="text-muted-foreground">—</span>
  return text
}
