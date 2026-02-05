'use client';

import { Button } from '@/components/ui/button';
import { Trash2, Save } from 'lucide-react';

interface TableToolbarProps {
  /** 선택된 행 개수 */
  selectedCount: number;

  /** 삭제 버튼 클릭 핸들러 */
  onDelete?: () => void;

  /** 저장 버튼 클릭 핸들러 */
  onSave?: () => void;

  /** 저장 버튼 표시 여부 (기본: false) */
  showSave?: boolean;
}

export function TableToolbar({
  selectedCount,
  onDelete,
  onSave,
  showSave = false,
}: TableToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200">
      <span className="text-sm text-blue-700 font-medium">
        {selectedCount}개 선택됨
      </span>

      <div className="flex-1" />

      {showSave && onSave && (
        <Button
          size="sm"
          variant="default"
          className="h-7"
          onClick={onSave}
        >
          <Save className="h-3.5 w-3.5 mr-1" />
          저장
        </Button>
      )}

      {onDelete && (
        <Button
          size="sm"
          variant="destructive"
          className="h-7"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          삭제
        </Button>
      )}
    </div>
  );
}
