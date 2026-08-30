'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { tableDensity } from '@/components/shared/table/density'
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
  fillHeight?: boolean
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
  fillHeight = false,
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
    <div
      className={cn(
        'w-full bg-card [&_tbody_svg]:text-primary',
        fillHeight ? 'flex h-full min-h-0 flex-1 flex-col' : 'overflow-hidden rounded-card border border-border',
        containerClassName,
      )}
    >
      <div className={cn(fillHeight && 'min-h-0 flex-1 overflow-y-auto')}>
      <Table className={cn('min-w-full', tableClassName)}>
        <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <TableRow className="border-b border-border bg-secondary hover:bg-secondary">
            {selection && (
              <TableHead className={cn('w-12 pl-2.5 pr-0 text-center', dense && tableDensity.rowHeight)}>
                <Checkbox
                  className={tableDensity.checkboxSize}
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected}
                  onCheckedChange={() => selection.onTogglePage(selectableIds)}
                  aria-label={allOnPageSelected ? 'Deselect all rows' : 'Select all rows'}
                  disabled={selectableIds.length === 0}
                />
              </TableHead>
            )}
            {showSerialNumber && (
              <TableHead
                className={cn(
                  'w-12 text-center font-semibold text-muted-foreground',
                  tableDensity.cellPaddingX,
                  tableDensity.headerText,
                  dense && tableDensity.rowHeight,
                )}
              >
                No.
              </TableHead>
            )}
            {columns.map((col, index) => (
              <TableHead
                key={col.key}
                className={cn(
                  tableDensity.cellPaddingX,
                  tableDensity.headerText,
                  'font-semibold text-muted-foreground',
                  dense && tableDensity.rowHeight,
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
                <TableCell
                  className={cn('w-12 pl-2.5 pr-0 text-center', dense && [tableDensity.cellPaddingY, tableDensity.rowHeight])}
                >
                  {isSelectable ? (
                    <Checkbox
                      className={tableDensity.checkboxSize}
                      checked={isRowSelected}
                      onCheckedChange={() => selection.onToggleRow(row.id)}
                      aria-label={selection.getRowLabel?.(row) ?? (isRowSelected ? 'Deselect row' : 'Select row')}
                    />
                  ) : null}
                </TableCell>
              )}
              {showSerialNumber && (
                <TableCell
                  className={cn(
                    'w-12 text-center font-medium text-muted-foreground',
                    tableDensity.cellPaddingX,
                    tableDensity.bodyText,
                    dense && [tableDensity.cellPaddingY, tableDensity.rowHeight],
                  )}
                >
                  {serialNumberStart + index}
                </TableCell>
              )}
              {columns.map((col, index) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    tableDensity.cellPaddingX,
                    tableDensity.bodyText,
                    'font-normal text-foreground',
                    dense && [tableDensity.cellPaddingY, tableDensity.rowHeight],
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
    </div>
  )
}

function renderCellValue<T extends { id: string }>(row: T, key: string) {
  const value = row[key as keyof T]
  const text = value == null ? '' : String(value).trim()
  if (!text) return <span className="text-muted-foreground">—</span>
  return text
}
