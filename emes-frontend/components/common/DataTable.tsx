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
  allowSort?: boolean    // 정렬 가능 여부 (기본: false)
  allowBlank?: boolean   // 빈 값 허용 여부 (기본: true), false면 필수 입력
}

// --- Props ---

interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  title?: string  // 테이블 타이틀
  resizableColumns?: boolean
  editable?: boolean  // 편집 가능 여부
  selectable?: boolean  // 체크박스 선택 가능 여부
  onUpdate?: (row: T) => Promise<void>  // 행 업데이트 콜백
  onBulkDelete?: (rows: T[]) => Promise<void>  // 일괄 삭제 콜백
  onEditChange?: (isEditing: boolean) => void  // 편집 상태 변경 콜백
  getRowId?: (row: T) => string | number  // 행 ID 추출 함수
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

  // useRef로 dragState 관리 (리렌더링 방지)
  const dragStateRef = React.useRef<{
    colIndex: number
    startX: number
    startWidths: number[]
  } | null>(null)

  const tableRef = React.useRef<HTMLTableElement>(null)

  React.useEffect(() => {
    const newWidths = columns.map((col) => parseWidth(col.width))
    setColumnWidths(newWidths)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns.length])

  const handleMouseDown = React.useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      if (!enabled) return
      e.preventDefault()

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

      // 현재 칼럼 너비만 마우스 거리만큼 변경
      const startWidth = ds.startWidths[ds.colIndex]
      const newWidth = Math.max(minW, startWidth + delta)

      // 새로운 너비 배열 생성 (현재 칼럼만 변경)
      const newWidths = ds.startWidths.map((w, i) => {
        if (i === ds.colIndex) {
          return newWidth
        }
        return w
      })

      // 상태 업데이트
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

  return { columnWidths, handleMouseDown, tableRef }
}

// --- Ref handle type ---

export interface DataTableHandle {
  saveEdit: () => Promise<void>
  isEditing: () => boolean
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
  onUpdate,
  onBulkDelete,
  onEditChange,
  getRowId,
  className,
}: DataTableProps<T>, ref: React.Ref<DataTableHandle>) {
  // Cell selection state
  const [selectedCells, setSelectedCells] = React.useState<Set<string>>(new Set())
  const isDragging = React.useRef(false)
  const dragStart = React.useRef<{ row: number; col: number } | null>(null)

  // Sort state
  const [sortState, setSortState] = React.useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Active row state (for footer display)
  const [activeRowIndex, setActiveRowIndex] = React.useState<number | null>(null)

  // Column resize
  const { columnWidths, handleMouseDown, tableRef } = useColumnResize(
    columns as DataTableColumn<unknown>[],
    resizableColumns
  )

  // Editing (conditional)
  const editHook = useTableEdit<T>(getRowId)
  const {
    isEditing,
    editingData,
    startEdit,
    cancelEdit,
    updateEditingData,
    saveEdit,
  } = editable ? editHook : {
    isEditing: () => false,
    editingData: null,
    startEdit: () => {},
    cancelEdit: () => {},
    updateEditingData: () => {},
    saveEdit: () => null,
  }

  // Selection (conditional)
  const selectionHook = useTableSelection<T>(data, getRowId)
  const {
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isRowSelected,
    toggleRow,
    toggleAll,
    getSelectedRows,
    clearSelection,
  } = selectable ? selectionHook : {
    selectedCount: 0,
    isAllSelected: false,
    isSomeSelected: false,
    isRowSelected: () => false,
    toggleRow: () => {},
    toggleAll: () => {},
    getSelectedRows: () => [],
    clearSelection: () => {},
  }

  // Handle column sort
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

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortState.direction === 'asc' ? 1 : -1
      if (bValue == null) return sortState.direction === 'asc' ? -1 : 1

      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Default string comparison
      const aStr = String(aValue)
      const bStr = String(bValue)
      return sortState.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }, [data, sortState, loading])

  // Calculate selection boundaries
  const getSelectionBounds = () => {
    if (selectedCells.size === 0) return null

    const rows = Array.from(selectedCells).map(id => parseInt(id.split('-')[0]))
    const cols = Array.from(selectedCells).map(id => parseInt(id.split('-')[1]))

    return {
      minRow: Math.min(...rows),
      maxRow: Math.max(...rows),
      minCol: Math.min(...cols),
      maxCol: Math.max(...cols),
    }
  }

  // Row selection handler
  const handleRowSelect = (rowIndex: number) => {
    const cells = new Set<string>()
    columns.forEach((_, colIndex) => {
      cells.add(`${rowIndex}-${colIndex}`)
    })
    setSelectedCells(cells)
  }

  // Cell selection handlers
  const handleCellMouseDown = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    // 리사이즈 핸들 클릭 시 셀 선택 무시
    if ((e.target as HTMLElement).getAttribute('role') === 'separator') return

    e.preventDefault()
    isDragging.current = true
    dragStart.current = { row: rowIndex, col: colIndex }
    setSelectedCells(new Set([`${rowIndex}-${colIndex}`]))
  }

  const handleCellMouseEnter = (rowIndex: number, colIndex: number) => {
    if (!isDragging.current || !dragStart.current) return

    const cells = new Set<string>()
    const startRow = Math.min(dragStart.current.row, rowIndex)
    const endRow = Math.max(dragStart.current.row, rowIndex)
    const startCol = Math.min(dragStart.current.col, colIndex)
    const endCol = Math.max(dragStart.current.col, colIndex)

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        cells.add(`${r}-${c}`)
      }
    }
    setSelectedCells(cells)
  }

  const handleMouseUp = React.useCallback(() => {
    isDragging.current = false
  }, [])

  // Copy to clipboard
  const handleCopy = React.useCallback(async () => {
    if (selectedCells.size === 0) return

    const bounds = getSelectionBounds()
    if (!bounds) return

    try {
      // Build 2D array of selected cell data
      const clipboardData: string[][] = []

      for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
        const rowData: string[] = []
        for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
          if (selectedCells.has(`${r}-${c}`)) {
            const row = data[r]
            const col = columns[c]
            const record = row as Record<string, unknown>
            const value = record[col.key]

            // Convert value to string
            let cellText = ''
            if (value === null || value === undefined) {
              cellText = ''
            } else if (typeof value === 'object') {
              cellText = JSON.stringify(value)
            } else {
              cellText = String(value)
            }

            rowData.push(cellText)
          } else {
            rowData.push('')
          }
        }
        clipboardData.push(rowData)
      }

      // Convert to TSV format (Excel-compatible)
      const text = clipboardData.map(row => row.join('\t')).join('\n')

      // Copy to clipboard
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }, [selectedCells, data, columns])

  // Global mouseup listener
  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseUp])

  // Keyboard shortcuts (Ctrl+C / Cmd+C)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedCells.size > 0) {
          e.preventDefault()
          handleCopy()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleCopy, selectedCells.size])

  // Handle row save (editing mode)
  const handleSaveEdit = async () => {
    if (!onUpdate || !editingData) return

    const savedData = saveEdit()
    if (!savedData) return

    try {
      await onUpdate(savedData as T)
      toast.success('저장되었습니다')
    } catch (error) {
      toast.error('저장에 실패했습니다')
      console.error('Save error:', error)
      throw error
    }
  }

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    saveEdit: handleSaveEdit,
    isEditing: () => editingData !== null,
    getSelectedRows,
    clearSelection,
  }))

  // Notify parent of edit state changes
  React.useEffect(() => {
    if (onEditChange) {
      onEditChange(editingData !== null)
    }
  }, [editingData, onEditChange])

  // Handle row click (start edit or set active row)
  const handleRowClick = (row: T, rowIndex: number) => {
    setActiveRowIndex(rowIndex) // Always set active row
    if (!editable) return
    if (isEditing(row, rowIndex)) return
    startEdit(row, rowIndex)
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!onBulkDelete) return

    const selected = getSelectedRows()
    if (selected.length === 0) return

    try {
      await onBulkDelete(selected)
      toast.success(`${selected.length}개 항목이 삭제되었습니다`)
      clearSelection()
    } catch (error) {
      toast.error('삭제에 실패했습니다')
      console.error('Bulk delete error:', error)
    }
  }

  // Calculate minimum table width (sum of all column widths)
  const minTableWidth = React.useMemo(() => {
    if (!resizableColumns) return undefined

    let total = 5 // row selector
    if (selectable) total += 20 // checkbox column

    // Add all column widths
    columnWidths.forEach(width => {
      total += width
    })

    return total
  }, [resizableColumns, selectable, columnWidths])

  return (
    <div className={cn("h-full flex flex-col gap-3", className)}>
      {/* Table */}
      <div className="flex-1 rounded-md border shadow-sm overflow-auto">
        {title && (
          <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-50 to-slate-100 border-b px-3 py-1.5 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-700">{title}</h3>
          </div>
        )}
        <Table
          unwrapped
          ref={tableRef}
          className={cn("w-full", title && "[&_thead]:!top-[28px]")}
          style={minTableWidth ? { minWidth: `${minTableWidth}px` } : undefined}
        >
          <colgroup>
            <col style={{ width: '5px' }} />
            {selectable && <col style={{ width: '20px' }} />}
            {resizableColumns && columns.map((col, i) => (
              <col key={col.key} style={{ width: `${columnWidths[i]}px` }} />
            ))}
            {/* Empty column to fill remaining space */}
            <col />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1 px-0" />
              {selectable && (
                <TableHead
                  className="w-[20px] text-center cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                  onClick={toggleAll}
                >
                  <span className="text-[10px]">선택</span>
                </TableHead>
              )}
              {columns.map((col, colIndex) => {
                const isResizable = resizableColumns && col.resizable !== false
                const isSortable = col.allowSort === true
                const isSorted = sortState?.key === col.key
                const isRequired = col.allowBlank === false

                return (
                  <TableHead
                    key={col.key}
                    style={
                      !resizableColumns && col.width
                        ? { width: col.width }
                        : undefined
                    }
                    className={cn(
                      "relative select-none whitespace-nowrap",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      isSortable && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => isSortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      <span className={cn(isRequired && "text-primary font-semibold")}>
                        {col.header}
                      </span>
                      {isRequired && (
                        <span className="text-destructive text-[10px]">*</span>
                      )}
                      {isSortable && (
                        <span className="text-muted-foreground">
                          {isSorted ? (
                            sortState.direction === 'asc' ? (
                              <ArrowUp className="h-2.5 w-2.5" />
                            ) : (
                              <ArrowDown className="h-2.5 w-2.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-2.5 w-2.5" />
                          )}
                        </span>
                      )}
                    </div>
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
              {/* Empty column to fill remaining space */}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1 + (selectable ? 1 : 0) + 1} className="h-20">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-[9px]">로딩 중...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1 + (selectable ? 1 : 0) + 1} className="h-20">
                  <div className="flex items-center justify-center text-[9px] text-muted-foreground">
                    {emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, rowIndex) => {
                const record = row as Record<string, unknown>
                const bounds = getSelectionBounds()
                const isCurrentlyEditing = isEditing(row, rowIndex)
                const isCurrentRowSelected = isRowSelected(row, rowIndex)

                return (
                  <TableRow
                    key={(record.id as string | number) ?? rowIndex}
                    onClick={(e) => {
                      // Don't trigger if clicking on checkbox or buttons
                      if ((e.target as HTMLElement).closest('button, input[type="checkbox"]')) return
                      setActiveRowIndex(rowIndex)
                    }}
                    onDoubleClick={(e) => {
                      // Don't trigger row click if clicking on checkbox or buttons
                      if ((e.target as HTMLElement).closest('button, input[type="checkbox"]')) return
                      handleRowClick(row, rowIndex)
                    }}
                    className={cn(
                      editable && !isCurrentlyEditing && "cursor-pointer",
                      isCurrentlyEditing && "bg-blue-50",
                      activeRowIndex === rowIndex && !isCurrentlyEditing && "bg-slate-100"
                    )}
                  >
                    {/* Row selector cell */}
                    <TableCell
                      className="w-1.5 px-0 cursor-pointer bg-muted/50 hover:bg-muted/70 group transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRowSelect(rowIndex)
                      }}
                    >
                      <div className="flex items-center justify-center h-full">
                        <ChevronRight className="h-2 w-2 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </TableCell>

                    {/* Checkbox cell or Cancel button (edit mode) */}
                    {selectable && (
                      <TableCell className="w-[20px] p-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          {editable && isCurrentlyEditing ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEdit()
                              }}
                            >
                              <X className="h-2.5 w-2.5 text-red-600" />
                            </Button>
                          ) : (
                            <Checkbox
                              checked={isCurrentRowSelected}
                              onCheckedChange={() => toggleRow(row, rowIndex)}
                              aria-label="행 선택"
                              className="h-2.5 w-2.5"
                            />
                          )}
                        </div>
                      </TableCell>
                    )}

                    {/* Data cells */}
                    {columns.map((col, colIndex) => {
                      const cellId = `${rowIndex}-${colIndex}`
                      const isSelected = selectedCells.has(cellId)

                      // Check if cell is on selection boundary
                      const isTopEdge = bounds && isSelected && rowIndex === bounds.minRow
                      const isBottomEdge = bounds && isSelected && rowIndex === bounds.maxRow
                      const isLeftEdge = bounds && isSelected && colIndex === bounds.minCol
                      const isRightEdge = bounds && isSelected && colIndex === bounds.maxCol

                      // Editable cell - not in edit mode (supports cell selection)
                      if (editable && !isCurrentlyEditing) {
                        return (
                          <TableCell
                            key={col.key}
                            onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
                            onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                            className={cn(
                              "truncate cursor-default transition-colors relative whitespace-nowrap",
                              isSelected && "bg-primary/5",
                              isTopEdge && "border-t-2 border-t-primary",
                              isBottomEdge && "border-b-2 border-b-primary",
                              isLeftEdge && "border-l-2 border-l-primary",
                              isRightEdge && "border-r-2 border-r-primary",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right"
                            )}
                          >
                            {col.render
                              ? col.render(record[col.key], row, rowIndex)
                              : (record[col.key] as React.ReactNode) ?? "-"}
                          </TableCell>
                        )
                      }

                      // Editable cell - in edit mode (uses EditableCell)
                      if (editable && isCurrentlyEditing) {
                        return (
                          <EditableCell
                            key={col.key}
                            isEditing={isCurrentlyEditing}
                            value={(editingData as Record<string, unknown>)?.[col.key]}
                            row={row}
                            rowIndex={rowIndex}
                            cellKey={col.key}
                            align={col.align}
                            render={col.render}
                            onChange={(key, value) => updateEditingData(key as keyof T, value)}
                            className={cn(
                              isSelected && "bg-primary/5",
                              isTopEdge && "border-t-2 border-t-primary",
                              isBottomEdge && "border-b-2 border-b-primary",
                              isLeftEdge && "border-l-2 border-l-primary",
                              isRightEdge && "border-r-2 border-r-primary"
                            )}
                          />
                        )
                      }

                      // Standard cell (non-editable)
                      return (
                        <TableCell
                          key={col.key}
                          onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
                          onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                          className={cn(
                            "truncate cursor-default transition-colors relative whitespace-nowrap",
                            isSelected && "bg-primary/5",
                            isTopEdge && "border-t-2 border-t-primary",
                            isBottomEdge && "border-b-2 border-b-primary",
                            isLeftEdge && "border-l-2 border-l-primary",
                            isRightEdge && "border-r-2 border-r-primary",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right"
                          )}
                        >
                          {col.render
                            ? col.render(record[col.key], row, rowIndex)
                            : (record[col.key] as React.ReactNode) ?? "-"}
                        </TableCell>
                      )
                    })}

                    {/* Empty column to fill remaining space */}
                    <TableCell />
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {!loading && sortedData.length > 0 && (
        <div className="flex items-center justify-between px-2 py-1 border rounded-md bg-muted/20 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>총 <span className="font-semibold text-foreground">{sortedData.length}</span>개 행</span>
            {activeRowIndex !== null && (
              <span className="text-primary font-medium">
                {activeRowIndex + 1}번째 행 선택됨
              </span>
            )}
          </div>
          {selectedCount > 0 && (
            <span>
              <span className="font-semibold text-foreground">{selectedCount}</span>개 항목 선택됨
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Export as forwardRef component
export const DataTable = React.forwardRef(DataTableInner) as <T extends object>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableHandle> }
) => ReturnType<typeof DataTableInner>
