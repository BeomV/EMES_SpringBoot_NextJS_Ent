'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { Plus } from 'lucide-react';
import { useListPage } from '@/hooks/list/useListPage';
import type { BaseSearchParams } from '@/types/list-page';
import type { DataTableFilter } from '@/components/common/DataTable';

export interface ListPageWrapperProps<
  TData,
  TSearchParams extends BaseSearchParams,
> {
  /** 페이지 제목 */
  title: string;

  /** 페이지 설명 */
  description: string;

  /** 추가 버튼 텍스트 */
  addButtonLabel: string;

  /** 테이블 컬럼 정의 (handleDelete 인자 없이 정의) */
  columns: (handleDelete: (id: number | string) => void) => DataTableColumn<TData>[];

  /** API 설정 */
  api: {
    list: (params: TSearchParams) => Promise<any>;
    delete?: (id: number | string) => Promise<any>;
    customActions?: Record<string, (id: number | string, ...args: any[]) => Promise<any>>;
  };

  /** 필터 매퍼 함수 */
  filterMapper: (filters: Record<string, string>) => Partial<TSearchParams>;

  /** 엔티티 ID 추출 함수 */
  getEntityId: (item: TData) => number | string;

  /** 엔티티 이름 */
  entityName: string;

  /** 필터 설정 */
  filters: DataTableFilter[];

  /** 초기 파라미터 (선택사항) */
  defaultParams?: Partial<TSearchParams>;
}

/**
 * 리스트 페이지 공통 래퍼 컴포넌트
 * 반복되는 코드를 제거하고 일관된 UI/UX 제공
 *
 * @example
 * ```typescript
 * export default function CodesPage() {
 *   return (
 *     <ListPageWrapper<Code, CodeSearchParams>
 *       title="기초코드 관리"
 *       description="기초코드를 관리합니다."
 *       addButtonLabel="코드 추가"
 *       columns={columns}
 *       api={{ list: codesApi.list, delete: codesApi.delete }}
 *       filterMapper={createCodeFilterMapper()}
 *       getEntityId={(code) => code.codeId}
 *       entityName="기초코드"
 *       filters={filterConfig}
 *     />
 *   );
 * }
 * ```
 */
export function ListPageWrapper<
  TData extends object,
  TSearchParams extends BaseSearchParams,
>({
  title,
  description,
  addButtonLabel,
  columns,
  api,
  filterMapper,
  getEntityId,
  entityName,
  filters,
  defaultParams,
}: ListPageWrapperProps<TData, TSearchParams>) {
  const { data, loading, handleFilter, handleDelete } = useListPage<
    TData,
    TSearchParams
  >({
    api,
    filterMapper,
    getEntityId,
    entityName,
    defaultParams,
  });

  // 컬럼 정의할 때 handleDelete 함수 주입
  const resolvedColumns = columns(handleDelete);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader title={title} description={description}>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            {addButtonLabel}
          </Button>
        </PageHeader>

        <DataTable<TData>
          columns={resolvedColumns}
          data={data}
          loading={loading}
          emptyMessage={`${entityName}을(를) 찾을 수 없습니다.`}
          filters={filters}
          onFilter={handleFilter}
          resizableColumns
        />
      </div>
    </DashboardLayout>
  );
}
