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
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200">
      <span className="text-xs text-slate-600 font-medium">
        {selectedCount}개 선택
      </span>

      <div className="flex-1" />

      {showSave && onSave && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 w-14 px-3.5 py-0.5 text-[10px] font-medium border-blue-500 text-blue-600 bg-white shadow hover:bg-blue-50 hover:shadow-lg transition-all"
          onClick={onSave}
        >
          <Save className="h-3 w-3" />
          저장
        </Button>
      )}

      {onDelete && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 w-14 px-3.5 py-0.5 text-[10px] font-medium border-red-500 text-red-600 bg-white shadow hover:bg-red-50 hover:shadow-lg transition-all"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
          삭제
        </Button>
      )}
    </div>
  );
}
