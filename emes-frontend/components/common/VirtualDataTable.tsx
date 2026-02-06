'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { Loader2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

// --- Types ---

export interface VirtualDataTableColumn<T> {
  key: string;
  header: string;
  width: number; // 고정 너비 필수 (가상 스크롤링)
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  allowSort?: boolean;
  editable?: boolean; // 편집 가능 여부
}

interface VirtualDataTableProps<T extends object> {
  columns: VirtualDataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  rowHeight?: number; // 행 높이 (기본: 40px)
  height?: number; // 테이블 높이 (기본: 600px)
  selectable?: boolean;
  editable?: boolean;
  onUpdate?: (row: T) => Promise<void>;
  onSelectionChange?: (selectedRows: T[]) => void;
  getRowId?: (row: T, index: number) => string | number;
  className?: string;
}

// --- Main Component ---

export function VirtualDataTable<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  title,
  rowHeight = 40,
  height = 600,
  selectable = false,
  editable = false,
  onUpdate,
  onSelectionChange,
  getRowId = (_, index) => index,
  className,
}: VirtualDataTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());

  // Editing state
  const [editingIds, setEditingIds] = React.useState<Set<string | number>>(new Set());
  const [editingDataMap, setEditingDataMap] = React.useState<Map<string | number, Partial<T>>>(new Map());

  // Sort state
  const [sortState, setSortState] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Calculate total width
  const totalWidth = React.useMemo(() => {
    let width = 0;
    if (selectable) width += 50;
    columns.forEach((col) => {
      width += col.width;
    });
    return width;
  }, [columns, selectable]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortState || loading) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortState.key];
      const bValue = (b as Record<string, unknown>)[sortState.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortState.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortState.direction === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortState.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortState, loading]);

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  // Handle sort
  const handleSort = (key: string) => {
    if (!sortState || sortState.key !== key) {
      setSortState({ key, direction: 'asc' });
    } else if (sortState.direction === 'asc') {
      setSortState({ key, direction: 'desc' });
    } else {
      setSortState(null);
    }
  };

  // Selection handlers
  const toggleRow = React.useCallback(
    (row: T, index: number) => {
      const rowId = getRowId(row, index);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(rowId)) {
          next.delete(rowId);
        } else {
          next.add(rowId);
        }
        return next;
      });
    },
    [getRowId]
  );

  const toggleAll = () => {
    if (selectedIds.size === sortedData.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = sortedData.map((row, index) => getRowId(row, index));
      setSelectedIds(new Set(allIds));
    }
  };

  // Editing handlers
  const startEdit = React.useCallback(
    (row: T, index: number) => {
      const rowId = getRowId(row, index);
      if (editingIds.has(rowId)) return;

      setEditingIds((prev) => new Set(prev).add(rowId));
      setEditingDataMap((prev) => {
        const next = new Map(prev);
        next.set(rowId, { ...row });
        return next;
      });
    },
    [editingIds, getRowId]
  );

  const updateField = React.useCallback(
    (row: T, index: number, key: keyof T, value: any) => {
      const rowId = getRowId(row, index);
      setEditingDataMap((prev) => {
        const next = new Map(prev);
        const rowData = next.get(rowId);
        if (rowData) {
          next.set(rowId, { ...rowData, [key]: value });
        }
        return next;
      });
    },
    [getRowId]
  );

  const isRowEditing = React.useCallback(
    (row: T, index: number): boolean => {
      const rowId = getRowId(row, index);
      return editingIds.has(rowId);
    },
    [editingIds, getRowId]
  );

  const saveEdit = async () => {
    if (!onUpdate || editingIds.size === 0) return;

    const editedRows = Array.from(editingDataMap.values()) as T[];
    try {
      await Promise.all(editedRows.map((row) => onUpdate(row)));
      setEditingIds(new Set());
      setEditingDataMap(new Map());
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const cancelEdit = () => {
    setEditingIds(new Set());
    setEditingDataMap(new Map());
  };

  // Notify selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selected = sortedData.filter((row, index) => {
        const rowId = getRowId(row, index);
        return selectedIds.has(rowId);
      });
      onSelectionChange(selected);
    }
  }, [selectedIds, sortedData, getRowId, onSelectionChange]);

  return (
    <div className={cn('h-full flex flex-col gap-3', className)}>
      {/* Header */}
      {title && (
        <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 border rounded-md">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
      )}

      {/* Action buttons */}
      {editable && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={saveEdit}
            disabled={editingIds.size === 0}
            className="h-6 px-3 text-[10px] bg-blue-500 text-white hover:bg-blue-600"
          >
            저장 ({editingIds.size})
          </Button>
          <Button
            size="sm"
            onClick={cancelEdit}
            disabled={editingIds.size === 0}
            className="h-6 px-3 text-[10px] bg-gray-500 text-white hover:bg-gray-600"
          >
            취소
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 rounded-md border shadow-sm overflow-hidden">
        {/* Column Headers */}
        <div
          className="flex items-center bg-muted border-b sticky top-0 z-10"
          style={{ width: totalWidth, height: rowHeight }}
        >
          {selectable && (
            <div className="flex items-center justify-center px-2" style={{ width: 50 }}>
              <Checkbox
                checked={selectedIds.size === sortedData.length && sortedData.length > 0}
                onCheckedChange={toggleAll}
                className="h-3 w-3"
              />
            </div>
          )}
          {columns.map((col) => {
            const isSortable = col.allowSort === true;
            const isSorted = sortState?.key === col.key;

            return (
              <div
                key={col.key}
                className={cn(
                  'px-3 text-xs font-semibold truncate flex items-center gap-1',
                  isSortable && 'cursor-pointer hover:bg-muted/80',
                  col.align === 'center' && 'justify-center',
                  col.align === 'right' && 'justify-end'
                )}
                style={{ width: col.width, minWidth: col.width }}
                onClick={() => isSortable && handleSort(col.key)}
              >
                <span>{col.header}</span>
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
            );
          })}
        </div>

        {/* Virtual List */}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">로딩 중...</span>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-muted-foreground">{emptyMessage}</span>
          </div>
        ) : (
          <div ref={parentRef} style={{ height: height - rowHeight, overflow: 'auto' }}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: totalWidth,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const index = virtualItem.index;
                const row = sortedData[index];
                const rowId = getRowId(row, index);
                const isSelected = selectedIds.has(rowId);
                const isEditing = isRowEditing(row, index);
                const editingData = editingDataMap.get(rowId) || row;
                const record = editingData as Record<string, unknown>;

                return (
                  <div
                    key={virtualItem.key}
                    className={cn(
                      'flex items-center border-b hover:bg-muted/50 transition-colors absolute top-0 left-0 w-full',
                      isSelected && 'bg-blue-50',
                      isEditing && 'bg-yellow-50'
                    )}
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    onDoubleClick={() => editable && startEdit(row, index)}
                  >
                    {/* Checkbox */}
                    {selectable && (
                      <div className="flex items-center justify-center px-2" style={{ width: 50 }}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(row, index)}
                          className="h-3 w-3"
                        />
                      </div>
                    )}

                    {/* Columns */}
                    {columns.map((col) => {
                      const value = record[col.key];
                      const isEditableCell = editable && isEditing && col.editable !== false;

                      return (
                        <div
                          key={col.key}
                          className={cn(
                            'px-3 text-xs truncate',
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right'
                          )}
                          style={{ width: col.width, minWidth: col.width }}
                        >
                          {isEditableCell ? (
                            <Input
                              className="h-6 text-xs px-2"
                              value={String(value ?? '')}
                              onChange={(e) => updateField(row, index, col.key as keyof T, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : col.render ? (
                            col.render(value, row, index)
                          ) : (
                            <span>{String(value ?? '-')}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2 py-1 border rounded-md bg-muted/20 text-[9px] text-muted-foreground">
        <span>
          총 <span className="font-semibold text-foreground">{sortedData.length.toLocaleString()}</span>개 행
        </span>
        {selectedIds.size > 0 && (
          <span>
            <span className="font-semibold text-foreground">{selectedIds.size}</span>개 항목 선택됨
          </span>
        )}
        {editingIds.size > 0 && (
          <span className="text-yellow-600 font-semibold">
            {editingIds.size}개 행 편집 중
          </span>
        )}
      </div>
    </div>
  );
}
