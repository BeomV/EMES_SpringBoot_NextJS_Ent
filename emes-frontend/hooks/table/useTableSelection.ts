import { useState, useCallback, useMemo } from 'react';

/**
 * 테이블 체크박스 선택을 관리하는 hook
 *
 * @template T - 데이터 타입
 * @param data - 전체 데이터 배열
 * @param getRowId - 행 ID 추출 함수
 * @returns 선택 상태와 핸들러들
 */
export function useTableSelection<T extends object>(
  data: T[],
  getRowId?: (row: T) => string | number
) {
  // 선택된 행 ID들
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(new Set());

  /**
   * 모든 행이 선택되었는지 확인
   */
  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false;
    return selectedRowIds.size === data.length;
  }, [data.length, selectedRowIds.size]);

  /**
   * 일부 행만 선택되었는지 확인 (indeterminate 상태)
   */
  const isSomeSelected = useMemo(() => {
    return selectedRowIds.size > 0 && selectedRowIds.size < data.length;
  }, [data.length, selectedRowIds.size]);

  /**
   * 특정 행이 선택되었는지 확인
   */
  const isRowSelected = useCallback((row: T, rowIndex: number): boolean => {
    const rowId = getRowId ? getRowId(row) : rowIndex;
    return selectedRowIds.has(rowId);
  }, [selectedRowIds, getRowId]);

  /**
   * 행 선택/해제 토글
   */
  const toggleRow = useCallback((row: T, rowIndex: number) => {
    const rowId = getRowId ? getRowId(row) : rowIndex;
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, [getRowId]);

  /**
   * 모든 행 선택/해제 토글
   */
  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedRowIds(new Set());
    } else {
      const allIds = data.map((row, index) =>
        getRowId ? getRowId(row) : index
      );
      setSelectedRowIds(new Set(allIds));
    }
  }, [data, getRowId, isAllSelected]);

  /**
   * 선택된 행들의 데이터 가져오기
   */
  const getSelectedRows = useCallback((): T[] => {
    return data.filter((row, index) => {
      const rowId = getRowId ? getRowId(row) : index;
      return selectedRowIds.has(rowId);
    });
  }, [data, selectedRowIds, getRowId]);

  /**
   * 선택 초기화
   */
  const clearSelection = useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  return {
    selectedRowIds,
    selectedCount: selectedRowIds.size,
    isAllSelected,
    isSomeSelected,
    isRowSelected,
    toggleRow,
    toggleAll,
    getSelectedRows,
    clearSelection,
  };
}
