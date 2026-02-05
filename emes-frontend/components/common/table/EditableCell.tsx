'use client';

import { Input } from '@/components/ui/input';
import { TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface EditableCellProps<T> {
  /** 편집 모드 여부 */
  isEditing: boolean;

  /** 셀 값 */
  value: unknown;

  /** 전체 행 데이터 */
  row: T;

  /** 행 인덱스 */
  rowIndex: number;

  /** 셀 키 */
  cellKey: string;

  /** 정렬 방향 */
  align?: 'left' | 'center' | 'right';

  /** 커스텀 렌더 함수 (편집 모드가 아닐 때) */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;

  /** 값 변경 핸들러 */
  onChange?: (key: string, value: any) => void;

  /** 추가 className */
  className?: string;
}

export function EditableCell<T extends object>({
  isEditing,
  value,
  row,
  rowIndex,
  cellKey,
  align,
  render,
  onChange,
  className,
}: EditableCellProps<T>) {
  if (isEditing) {
    // 편집 모드: Input 표시
    return (
      <TableCell
        className={cn(
          'p-1',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          className
        )}
      >
        <Input
          className="h-7 text-xs"
          value={String(value ?? '')}
          onChange={(e) => onChange?.(cellKey, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
    );
  }

  // 읽기 모드: 일반 표시
  const content = render ? render(value, row, rowIndex) : (value as React.ReactNode) ?? '-';

  return (
    <TableCell
      className={cn(
        'truncate',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {content}
    </TableCell>
  );
}
