import { useState, useCallback, useMemo } from 'react';

/**
 * 테이블 편집 모드를 관리하는 hook (다중 행 편집 지원)
 *
 * @template T - 데이터 타입
 * @param getRowId - 행 ID 추출 함수
 * @returns 편집 상태와 핸들러들
 */
export function useTableEdit<T extends object>(
  getRowId?: (row: T) => string | number
) {
  // 편집 중인 행 ID들 (Set)
  const [editingRowIds, setEditingRowIds] = useState<Set<string | number>>(new Set());

  // 편집 중인 행들의 데이터 (Map)
  const [editingDataMap, setEditingDataMap] = useState<Map<string | number, Partial<T>>>(new Map());

  /**
   * 편집 중인 행 개수
   */
  const editingCount = useMemo(() => editingRowIds.size, [editingRowIds.size]);

  /**
   * 단일 행 편집 시작
   */
  const startEdit = useCallback((row: T, rowIndex: number) => {
    const rowId = getRowId ? getRowId(row) : rowIndex;
    setEditingRowIds(new Set([rowId]));
    setEditingDataMap(new Map([[rowId, { ...row }]]));
  }, [getRowId]);

  /**
   * 다중 행 편집 시작
   */
  const startEditMultiple = useCallback((rows: T[], data: T[]) => {
    const ids = new Set<string | number>();
    const dataMap = new Map<string | number, Partial<T>>();

    rows.forEach((row) => {
      // Find the original index of the row in the data array
      const originalIndex = data.findIndex(d => {
        if (getRowId) {
          return getRowId(d) === getRowId(row);
        }
        return d === row;
      });

      const rowId = getRowId ? getRowId(row) : originalIndex;
      ids.add(rowId);
      dataMap.set(rowId, { ...row });
    });

    setEditingRowIds(ids);
    setEditingDataMap(dataMap);
  }, [getRowId]);

  /**
   * 기존 편집에 행 추가
   */
  const addToEdit = useCallback((row: T, rowIndex: number) => {
    const rowId = getRowId ? getRowId(row) : rowIndex;

    setEditingRowIds((prev) => {
      const next = new Set(prev);
      next.add(rowId);
      return next;
    });

    setEditingDataMap((prev) => {
      const next = new Map(prev);
      next.set(rowId, { ...row });
      return next;
    });
  }, [getRowId]);

  /**
   * 행 편집 취소
   */
  const cancelEdit = useCallback(() => {
    setEditingRowIds(new Set());
    setEditingDataMap(new Map());
  }, []);

  /**
   * 특정 행의 편집 데이터 업데이트
   */
  const updateEditingData = useCallback((
    row: T,
    rowIndex: number,
    key: keyof T,
    value: T[keyof T]
  ) => {
    const rowId = getRowId ? getRowId(row) : rowIndex;
    setEditingDataMap((prev) => {
      const next = new Map(prev);
      const rowData = next.get(rowId);
      if (rowData) {
        next.set(rowId, { ...rowData, [key]: value });
      }
      return next;
    });
  }, [getRowId]);

  /**
   * 특정 행의 편집 데이터 가져오기
   */
  const getEditingData = useCallback((row: T, rowIndex: number): Partial<T> | null => {
    const rowId = getRowId ? getRowId(row) : rowIndex;
    return editingDataMap.get(rowId) || null;
  }, [editingDataMap, getRowId]);

  /**
   * 편집 완료 (저장) - 모든 편집된 행 반환
   */
  const saveEdit = useCallback(() => {
    const editedRows = Array.from(editingDataMap.values()) as T[];
    cancelEdit();
    return editedRows;
  }, [editingDataMap, cancelEdit]);

  /**
   * 특정 행이 편집 중인지 확인
   */
  const isEditing = useCallback((row: T, rowIndex: number): boolean => {
    const rowId = getRowId ? getRowId(row) : rowIndex;
    return editingRowIds.has(rowId);
  }, [editingRowIds, getRowId]);

  return {
    editingRowIds,
    editingCount,
    editingDataMap,
    startEdit,
    startEditMultiple,
    addToEdit,
    cancelEdit,
    updateEditingData,
    getEditingData,
    saveEdit,
    isEditing,
  };
}
