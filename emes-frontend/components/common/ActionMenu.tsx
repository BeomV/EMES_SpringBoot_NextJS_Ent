'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 액션 메뉴 아이템 설정
 */
export interface ActionMenuItem {
  /** 메뉴 레이블 */
  label: string;

  /** 아이콘 컴포넌트 */
  icon?: React.ComponentType<{ className?: string }>;

  /** 클릭 핸들러 */
  onClick?: () => void | Promise<void>;

  /** 변형 스타일 ('default' | 'destructive') */
  variant?: 'default' | 'destructive';

  /** 구분선 */
  divider?: boolean;

  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * ActionMenu 컴포넌트 Props
 */
interface ActionMenuProps {
  /** 액션 메뉴 아이템 배열 */
  items: ActionMenuItem[];

  /** 드롭다운 정렬 위치 */
  align?: 'start' | 'center' | 'end';

  /** 추가 CSS 클래스 */
  className?: string;

  /** 버튼 크기 */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * ActionMenu 컴포넌트
 *
 * DropdownMenu의 복잡한 구조를 숨기고,
 * 간단한 아이템 배열로 액션 메뉴를 구성할 수 있는 컴포넌트
 *
 * @example
 * ```typescript
 * <ActionMenu
 *   items={[
 *     { label: '수정', icon: Edit, onClick: handleEdit },
 *     { label: '삭제', icon: Trash2, variant: 'destructive', onClick: handleDelete },
 *     { label: '더보기', icon: MoreHorizontal, divider: true },
 *   ]}
 * />
 * ```
 *
 * @description
 * 기존 코드:
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="ghost" size="icon" className="h-7 w-7">
 *       <MoreVertical className="h-3.5 w-3.5" />
 *     </Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent align="end">
 *     <DropdownMenuItem onClick={handleEdit}>
 *       <Edit className="mr-2 h-3.5 w-3.5" />
 *       수정
 *     </DropdownMenuItem>
 *     <DropdownMenuItem onClick={handleDelete} className="text-destructive">
 *       <Trash2 className="mr-2 h-3.5 w-3.5" />
 *       삭제
 *     </DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * 개선된 코드:
 * ```tsx
 * <ActionMenu
 *   items={[
 *     { label: '수정', icon: Edit, onClick: handleEdit },
 *     { label: '삭제', icon: Trash2, variant: 'destructive', onClick: handleDelete },
 *   ]}
 * />
 * ```
 *
 * 코드 감소: 18줄 → 4줄 (78% 감소)
 */
export function ActionMenu({ items, align = 'end', className, size = 'default' }: ActionMenuProps) {
  // 버튼 크기 설정
  const buttonSizeClass = {
    sm: 'h-7 w-7',
    default: 'h-8 w-8',
    lg: 'h-10 w-10',
  }[size];

  // 아이콘 크기 설정 (버튼 크기에 따라)
  const iconSizeClass = {
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(buttonSizeClass, className)}
        >
          <MoreVertical className={iconSizeClass} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider && index > 0 && <div className="my-1 h-px bg-border" />}
            <DropdownMenuItem
              onClick={item.onClick}
              disabled={item.disabled}
              className={item.variant === 'destructive' ? 'text-destructive' : ''}
            >
              {item.icon && (
                <item.icon className={cn('mr-2', iconSizeClass)} />
              )}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
