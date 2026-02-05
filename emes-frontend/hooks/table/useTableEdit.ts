import { useState, useCallback } from 'react';

/**
 * 테이블 편집 모드를 관리하는 hook
 *
 * @template T - 데이터 타입
 * @param getRowId - 행 ID 추출 함수
 * @returns 편집 상태와 핸들러들
 */
export function useTableEdit<T extends object>(
  getRowId?: (row: T) => string | number
) {
  // 편집 중인 행 ID
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null);

  // 편집 중인 행의 데이터
  const [editingData, setEditingData] = useState<Partial<T> | null>(null);

  /**
   * 행 편집 시작
   */
  const startEdit = useCallback((row: T, rowIndex: number) => {
    const rowId = getRowId ? getRowId(row) : rowIndex;
    setEditingRowId(rowId);
    setEditingData({ ...row });
  }, [getRowId]);

  /**
   * 행 편집 취소
   */
  const cancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditingData(null);
  }, []);

  /**
   * 편집 데이터 업데이트
   */
  const updateEditingData = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setEditingData((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  /**
   * 편집 완료 (저장)
   */
  const saveEdit = useCallback(() => {
    const data = editingData;
    cancelEdit();
    return data as T | null;
  }, [editingData, cancelEdit]);

  /**
   * 특정 행이 편집 중인지 확인
   */
  const isEditing = useCallback((row: T, rowIndex: number): boolean => {
    if (editingRowId === null) return false;
    const rowId = getRowId ? getRowId(row) : rowIndex;
    return rowId === editingRowId;
  }, [editingRowId, getRowId]);

  return {
    editingRowId,
    editingData,
    startEdit,
    cancelEdit,
    updateEditingData,
    saveEdit,
    isEditing,
  };
}
