'use client'

import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"
import { Loader2, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useTableEdit } from "@/hooks/table/useTableEdit"
import { useTableSelection } from "@/hooks/table/useTableSelection"
import { EditableCell } from "./table/EditableCell"

// --- Column type ---

export interface DataTableColumn<T> {
  key: string
  header: string
  width?: string
  align?: "left" | "center" | "right"
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  resizable?: boolean
  minWidth?: number
  allowSort?: boolean
  allowBlank?: boolean
}

// --- Props ---

interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  title?: string
  resizableColumns?: boolean
  editable?: boolean
  selectable?: boolean
  rowHeight?: number  // 행 높이 (가상 스크롤링용, 기본 28)
  onUpdate?: (row: T) => Promise<void>
  onBulkDelete?: (rows: T[]) => Promise<void>
  onEditChange?: (isEditing: boolean) => void
  onSelectionChange?: (selectedRows: T[]) => void
  getRowId?: (row: T) => string | number
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

  const dragStateRef = React.useRef<{
    colIndex: number
    startX: number
    startWidths: number[]
  } | null>(null)

  React.useEffect(() => {
    const newWidths = columns.map((col) => parseWidth(col.width))
    setColumnWidths(newWidths)
  }, [columns.length])

  const handleMouseDown = React.useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      if (!enabled) return
      e.preventDefault()
      e.stopPropagation()

      dragStateRef.current = {
        colIndex,
        startX: e.clientX,
        startWidths: [...columnWidths],
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [enabled, columnWidths]
  )

  React.useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (e: MouseEvent) => {
      const ds = dragStateRef.current
      if (!ds) return

      const delta = e.clientX - ds.startX
      const col = columns[ds.colIndex]
      const minW = col.minWidth ?? 50

      const startWidth = ds.startWidths[ds.colIndex]
      const newWidth = Math.max(minW, startWidth + delta)

      const newWidths = ds.startWidths.map((w, i) =>
        i === ds.colIndex ? newWidth : w
      )

      setColumnWidths(newWidths)
    }

    const handleMouseUp = () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      dragStateRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [enabled, columns])

  return { columnWidths, handleMouseDown }
}

// --- Ref handle type ---

export interface DataTableHandle {
  saveEdit: () => Promise<void>
  isEditing: () => boolean
  editingCount: () => number
  startMultiEdit: (rows: any[]) => void
  getSelectedRows: () => any[]
  clearSelection: () => void
}

// --- Main component ---

function DataTableInner<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  title,
  resizableColumns = false,
  editable = false,
  selectable = false,
  rowHeight = 28,
  onUpdate,
  onBulkDelete: _onBulkDelete,
  onEditChange,
  onSelectionChange,
  getRowId,
  className,
}: DataTableProps<T>, ref: React.Ref<DataTableHandle>) {
  // Refs
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Sort state
  const [sortState, setSortState] = React.useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Active row state
  const [activeRowIndex, setActiveRowIndex] = React.useState<number | null>(null)

  // Column resize
  const { columnWidths, handleMouseDown } = useColumnResize(
    columns as DataTableColumn<unknown>[],
    resizableColumns
  )

  // Editing hook
  const editHook = useTableEdit<T>(getRowId)
  const {
    isEditing,
    editingCount,
    startEdit,
    startEditMultiple,
    addToEdit,
    cancelEditRow,
    updateEditingData,
    getEditingData,
    saveEdit,
  } = editable ? editHook : {
    isEditing: () => false,
    editingCount: 0,
    startEdit: () => {},
    startEditMultiple: () => {},
    addToEdit: () => {},
    cancelEditRow: () => {},
    updateEditingData: () => {},
    getEditingData: () => null,
    saveEdit: () => [],
  }

  // Selection hook
  const selectionHook = useTableSelection<T>(data, getRowId)
  const {
    selectedCount,
    isRowSelected,
    toggleRow,
    toggleAll,
    getSelectedRows,
    clearSelection,
  } = selectable ? selectionHook : {
    selectedCount: 0,
    isRowSelected: () => false,
    toggleRow: () => {},
    toggleAll: () => {},
    getSelectedRows: () => [],
    clearSelection: () => {},
  }

  // Sort handler
  const handleSort = (key: string) => {
    if (!sortState || sortState.key !== key) {
      setSortState({ key, direction: 'asc' })
    } else if (sortState.direction === 'asc') {
      setSortState({ key, direction: 'desc' })
    } else {
      setSortState(null)
    }
  }

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortState || loading) return data

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortState.key]
      const bValue = (b as Record<string, unknown>)[sortState.key]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortState.direction === 'asc' ? 1 : -1
      if (bValue == null) return sortState.direction === 'asc' ? -1 : 1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aStr = String(aValue)
      const bStr = String(bValue)
      return sortState.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }, [data, sortState, loading])

  // Virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  // Handle row save
  const handleSaveEdit = async () => {
    if (!onUpdate || editingCount === 0) return

    const savedRows = saveEdit()
    if (!savedRows || savedRows.length === 0) return

    try {
      await Promise.all(savedRows.map((row) => onUpdate(row as T)))
      toast.success(`${savedRows.length}개 행이 저장되었습니다`)
    } catch (error) {
      toast.error('저장에 실패했습니다')
      console.error('Save error:', error)
      throw error
    }
  }

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    saveEdit: handleSaveEdit,
    isEditing: () => editingCount > 0,
    editingCount: () => editingCount,
    startMultiEdit: (rows: T[]) => startEditMultiple(rows, sortedData),
    getSelectedRows,
    clearSelection,
  }))

  // Notify parent of edit state changes
  React.useEffect(() => {
    if (onEditChange) {
      onEditChange(editingCount > 0)
    }
  }, [editingCount, onEditChange])

  // Notify parent of selection changes (debounced)
  const selectionNotifyRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => {
    if (selectionNotifyRef.current !== null) {
      clearTimeout(selectionNotifyRef.current)
    }
    selectionNotifyRef.current = setTimeout(() => {
      if (onSelectionChange && selectable) {
        onSelectionChange(getSelectedRows())
      }
    }, 50)
    return () => {
      if (selectionNotifyRef.current !== null) {
        clearTimeout(selectionNotifyRef.current)
      }
    }
  }, [selectedCount, onSelectionChange, selectable, getSelectedRows])

  // Handle row click
  const handleRowClick = (row: T, rowIndex: number) => {
    setActiveRowIndex(rowIndex)
    if (!editable) return
    if (isEditing(row, rowIndex)) return

    if (editingCount > 0) {
      addToEdit(row, rowIndex)
    } else {
      startEdit(row, rowIndex)
    }
  }

  // Calculate total width
  const totalWidth = React.useMemo(() => {
    let total = 5 // row selector
    if (selectable) total += 28
    columnWidths.forEach(w => { total += w })
    total += 50 // empty column
    return total
  }, [selectable, columnWidths])

  // Render header cell
  const renderHeaderCell = (col: DataTableColumn<T>, colIndex: number) => {
    const isResizable = resizableColumns && col.resizable !== false
    const isSortable = col.allowSort === true
    const isSorted = sortState?.key === col.key
    const isRequired = col.allowBlank === false

    return (
      <div
        key={col.key}
        className={cn(
          "flex-shrink-0 px-1.5 py-1 text-xs font-medium text-muted-foreground border-r last:border-r-0 relative select-none whitespace-nowrap",
          col.align === "center" && "text-center",
          col.align === "right" && "text-right",
          isSortable && "cursor-pointer hover:bg-muted/50"
        )}
        style={{ width: resizableColumns ? columnWidths[colIndex] : (col.width || 150) }}
        onClick={() => isSortable && handleSort(col.key)}
      >
        <div className="flex items-center gap-1">
          <span className={cn(isRequired && "text-primary font-semibold")}>
            {col.header}
          </span>
          {isRequired && <span className="text-destructive text-[10px]">*</span>}
          {isSortable && (
            <span className="text-muted-foreground">
              {isSorted ? (
                sortState.direction === 'asc'
                  ? <ArrowUp className="h-2.5 w-2.5" />
                  : <ArrowDown className="h-2.5 w-2.5" />
              ) : (
                <ArrowUpDown className="h-2.5 w-2.5" />
              )}
            </span>
          )}
        </div>
        {isResizable && (
          <div
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10"
            onMouseDown={(e) => handleMouseDown(colIndex, e)}
          />
        )}
      </div>
    )
  }

  // Render data cell
  const renderDataCell = (
    row: T,
    col: DataTableColumn<T>,
    rowIndex: number,
    isCurrentlyEditing: boolean
  ) => {
    const record = row as Record<string, unknown>

    if (editable && isCurrentlyEditing) {
      const rowEditingData = getEditingData(row, rowIndex)
      return (
        <EditableCell
          key={col.key}
          isEditing={isCurrentlyEditing}
          value={(rowEditingData as Record<string, unknown>)?.[col.key]}
          row={row}
          rowIndex={rowIndex}
          cellKey={col.key}
          align={col.align}
          render={col.render}
          onChange={(key, value) => updateEditingData(row, rowIndex, key as keyof T, value as T[keyof T])}
        />
      )
    }

    return (
      <div
        key={col.key}
        className={cn(
          "px-1.5 py-1 text-xs border-r last:border-r-0 truncate whitespace-nowrap",
          col.align === "center" && "text-center",
          col.align === "right" && "text-right"
        )}
      >
        {col.render
          ? col.render(record[col.key], row, rowIndex)
          : (record[col.key] as React.ReactNode) ?? "-"}
      </div>
    )
  }

  return (
    <div className={cn("h-full flex flex-col gap-2", className)}>
      {/* Container */}
      <div className="flex-1 rounded-md border shadow-sm overflow-hidden flex flex-col">
        {/* Title */}
        {title && (
          <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-slate-100 border-b px-3 py-1.5">
            <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
          </div>
        )}

        {/* Header */}
        <div
          className="flex-shrink-0 flex bg-muted border-b overflow-hidden"
          style={{ minWidth: totalWidth }}
        >
          {/* Row selector header */}
          <div className="flex-shrink-0 w-[5px] border-r" />

          {/* Selection header */}
          {selectable && (
            <div
              className="flex-shrink-0 w-[28px] px-1 py-1 text-center cursor-pointer hover:bg-muted/80 border-r"
              onClick={toggleAll}
            >
              <span className="text-[10px] text-muted-foreground">선택</span>
            </div>
          )}

          {/* Column headers */}
          {columns.map((col, i) => renderHeaderCell(col, i))}

          {/* Empty column */}
          <div className="flex-1 min-w-[50px]" />
        </div>

        {/* Body with virtual scrolling */}
        <div
          ref={parentRef}
          className="flex-1 overflow-auto custom-scrollbar"
        >
          {loading ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span className="text-[9px]">로딩 중...</span>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-[9px] text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
                minWidth: totalWidth,
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowIndex = virtualRow.index
                const row = sortedData[rowIndex]
                const record = row as Record<string, unknown>
                const isCurrentlyEditing = isEditing(row, rowIndex)
                const isCurrentRowSelected = isRowSelected(row, rowIndex)

                return (
                  <div
                    key={(record.id as string | number) ?? rowIndex}
                    className={cn(
                      "absolute left-0 w-full flex border-b hover:bg-muted/50 transition-colors",
                      editable && !isCurrentlyEditing && "cursor-pointer",
                      isCurrentlyEditing && "bg-blue-50",
                      activeRowIndex === rowIndex && !isCurrentlyEditing && "bg-slate-100"
                    )}
                    style={{
                      top: 0,
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${virtualRow.size}px`,
                    }}
                    onClick={() => setActiveRowIndex(rowIndex)}
                    onDoubleClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, input')) return
                      handleRowClick(row, rowIndex)
                    }}
                  >
                    {/* Row selector */}
                    <div className="flex-shrink-0 w-[5px] bg-muted/50 hover:bg-muted/70 flex items-center justify-center cursor-pointer">
                      <ChevronRight className="h-2 w-2 text-muted-foreground/30" />
                    </div>

                    {/* Checkbox or Cancel */}
                    {selectable && (
                      <div
                        className="flex-shrink-0 w-[28px] flex items-center justify-center border-r"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {editable && isCurrentlyEditing ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-red-50"
                            onClick={() => cancelEditRow(row, rowIndex)}
                          >
                            <X className="h-2.5 w-2.5 text-red-600" />
                          </Button>
                        ) : (
                          <Checkbox
                            checked={isCurrentRowSelected}
                            onCheckedChange={() => toggleRow(row, rowIndex)}
                            className="h-3.5 w-3.5 rounded-sm"
                          />
                        )}
                      </div>
                    )}

                    {/* Data cells */}
                    {columns.map((col, colIndex) => (
                      <div
                        key={col.key}
                        className="flex-shrink-0 flex items-center"
                        style={{
                          width: resizableColumns ? columnWidths[colIndex] : (parseInt(col.width || '150') || 150)
                        }}
                      >
                        {renderDataCell(row, col, rowIndex, isCurrentlyEditing)}
                      </div>
                    ))}

                    {/* Empty column */}
                    <div className="flex-1 min-w-[50px]" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {!loading && sortedData.length > 0 && (
        <div className="flex items-center justify-between px-2 py-1 border rounded-md bg-muted/20 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>총 <span className="font-semibold text-foreground">{sortedData.length.toLocaleString()}</span>개 행</span>
            {activeRowIndex !== null && (
              <span className="text-primary font-medium">
                {(activeRowIndex + 1).toLocaleString()}번째 행
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {editingCount > 0 && (
              <span className="text-yellow-600 font-semibold">
                {editingCount}개 행 편집 중
              </span>
            )}
            {selectedCount > 0 && (
              <span>
                <span className="font-semibold text-foreground">{selectedCount}</span>개 선택됨
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Export as forwardRef component
export const DataTable = React.forwardRef(DataTableInner) as <T extends object>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableHandle> }
) => ReturnType<typeof DataTableInner>
