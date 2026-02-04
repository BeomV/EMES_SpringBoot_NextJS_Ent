'use client'

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Search, Loader2, RotateCcw } from "lucide-react"

// --- Filter types ---

export interface DataTableFilterOption {
  label: string
  value: string
}

export interface DataTableFilter {
  key: string
  label: string
  type: 'text' | 'select'
  placeholder?: string
  options?: DataTableFilterOption[]
}

// --- Column type ---

export interface DataTableColumn<T> {
  key: string
  header: string
  width?: string
  align?: "left" | "center" | "right"
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  resizable?: boolean
  minWidth?: number
}

// --- Props ---

interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  // legacy single search
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  // multi filter
  filters?: DataTableFilter[]
  onFilter?: (filters: Record<string, string>) => void
  // column resizing
  resizableColumns?: boolean
  actions?: React.ReactNode
  className?: string
}

// --- Column resize hook ---

function useColumnResize(
  columns: DataTableColumn<unknown>[],
  enabled: boolean
) {
  const parseWidth = (w?: string): number => {
    if (!w) return 150
    const n = parseInt(w, 10)
    return isNaN(n) ? 150 : n
  }

  const [columnWidths, setColumnWidths] = React.useState<number[]>(() =>
    columns.map((col) => parseWidth(col.width))
  )

  const widthsRef = React.useRef<number[]>(columnWidths)
  const dragState = React.useRef<{
    colIndex: number
    startX: number
    startWidth: number
  } | null>(null)
  const tableRef = React.useRef<HTMLTableElement>(null)

  React.useEffect(() => {
    widthsRef.current = columnWidths
  }, [columnWidths])

  React.useEffect(() => {
    const newWidths = columns.map((col) => parseWidth(col.width))
    setColumnWidths(newWidths)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns.length])

  const handleMouseDown = React.useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      if (!enabled) return
      e.preventDefault()
      dragState.current = {
        colIndex,
        startX: e.clientX,
        startWidth: widthsRef.current[colIndex],
      }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [enabled]
  )

  React.useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (e: MouseEvent) => {
      const ds = dragState.current
      if (!ds) return
      const delta = e.clientX - ds.startX
      const col = columns[ds.colIndex]
      const minW = col.minWidth ?? 50
      const newWidth = Math.max(minW, ds.startWidth + delta)

      widthsRef.current = widthsRef.current.map((w, i) =>
        i === ds.colIndex ? newWidth : w
      )

      if (tableRef.current) {
        const cols = tableRef.current.querySelectorAll('colgroup col')
        if (cols[ds.colIndex]) {
          ;(cols[ds.colIndex] as HTMLElement).style.width = `${newWidth}px`
        }
      }
    }

    const handleMouseUp = () => {
      if (dragState.current) {
        setColumnWidths([...widthsRef.current])
        dragState.current = null
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [enabled, columns])

  return { columnWidths, handleMouseDown, tableRef }
}

// --- Main component ---

export function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  searchPlaceholder = "검색...",
  onSearch,
  filters,
  onFilter,
  resizableColumns = false,
  actions,
  className,
}: DataTableProps<T>) {
  // Filter state
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    filters?.forEach((f) => (initial[f.key] = ''))
    return initial
  })

  // Column resize
  const { columnWidths, handleMouseDown, tableRef } = useColumnResize(
    columns as DataTableColumn<unknown>[],
    resizableColumns
  )

  const handleReset = () => {
    const cleared: Record<string, string> = {}
    filters?.forEach((f) => (cleared[f.key] = ''))
    setFilterValues(cleared)
    onFilter?.(cleared)
  }

  const hasFilters = filters && filters.length > 0

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filter bar */}
      {hasFilters && (
        <div className="flex items-end gap-3 flex-wrap">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-1">
              <Label className="text-xs">{filter.label}</Label>
              {filter.type === 'text' ? (
                <Input
                  placeholder={filter.placeholder ?? ''}
                  className="h-7 text-xs w-40"
                  value={filterValues[filter.key] ?? ''}
                  onChange={(e) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      [filter.key]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onFilter?.(filterValues)
                  }}
                />
              ) : (
                <Select
                  value={filterValues[filter.key] || '__all__'}
                  onValueChange={(val) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      [filter.key]: val === '__all__' ? '' : val,
                    }))
                  }
                >
                  <SelectTrigger className="h-7 text-xs w-32">
                    <SelectValue placeholder={filter.placeholder ?? '전체'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">전체</SelectItem>
                    {filter.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={() => onFilter?.(filterValues)}>
              <Search className="h-3.5 w-3.5" />
              조회
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              초기화
            </Button>
          </div>
          {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
        </div>
      )}

      {/* Legacy single search toolbar */}
      {!hasFilters && (onSearch || actions) && (
        <div className="flex items-center justify-between gap-3">
          {onSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-8 h-7 text-xs"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table
          unwrapped
          ref={tableRef}
          className={cn(resizableColumns && "table-fixed")}
        >
          {resizableColumns && (
            <colgroup>
              {columns.map((col, i) => (
                <col key={col.key} style={{ width: `${columnWidths[i]}px` }} />
              ))}
            </colgroup>
          )}
          <TableHeader>
            <TableRow>
              {columns.map((col, colIndex) => {
                const isResizable = resizableColumns && col.resizable !== false
                return (
                  <TableHead
                    key={col.key}
                    style={
                      !resizableColumns && col.width
                        ? { width: col.width }
                        : undefined
                    }
                    className={cn(
                      "relative select-none",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right"
                    )}
                  >
                    {col.header}
                    {isResizable && (
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors"
                        onMouseDown={(e) => handleMouseDown(colIndex, e)}
                        role="separator"
                        aria-orientation="vertical"
                      />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">로딩 중...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32">
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    {emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const record = row as Record<string, unknown>
                return (
                  <TableRow key={(record.id as string | number) ?? rowIndex}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "truncate",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right"
                        )}
                      >
                        {col.render
                          ? col.render(record[col.key], row, rowIndex)
                          : (record[col.key] as React.ReactNode) ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
