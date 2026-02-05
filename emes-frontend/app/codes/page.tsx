'use client';

import { Badge } from '@/components/ui/badge';
import { ListPageWrapper } from '@/components/ListPageWrapper';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Edit, Trash2 } from 'lucide-react';
import { codesApi, createCodeFilterMapper } from '@/lib/api/codes';
import { formatDate } from '@/lib/utils/format';
import type { Code, CodeSearchParams } from '@/types/entities/code';
import type { DataTableColumn } from '@/components/common/DataTable';

export default function CodesPage() {
  const getColumns = (handleDelete: (id: number | string) => void): DataTableColumn<Code>[] => [
    {
      key: 'codeType',
      header: '코드 유형',
      width: '120px',
      render: (_, row: Code) => <span className="font-medium">{row.codeType}</span>,
    },
    {
      key: 'codeValue',
      header: '코드 값',
      width: '120px',
      render: (_, row: Code) => (
        <Badge variant="outline" className="font-mono">
          {row.codeValue}
        </Badge>
      ),
    },
    {
      key: 'codeName',
      header: '코드명',
      width: '150px',
      render: (_, row: Code) => row.codeName,
    },
    {
      key: 'description',
      header: '설명',
      render: (_, row: Code) => row.description || '-',
    },
    {
      key: 'sortOrder',
      header: '순서',
      width: '80px',
      align: 'center',
      render: (_, row: Code) => row.sortOrder,
    },
    {
      key: 'isActive',
      header: '상태',
      width: '100px',
      render: (_, row: Code) => (
        <Badge variant={row.isActive ? 'success' : 'secondary'}>
          {row.isActive ? '활성' : '비활성'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: '등록일',
      width: '100px',
      render: (_, row: Code) => (
        <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '40px',
      align: 'center',
      resizable: false,
      render: (_, row: Code) => (
        <ActionMenu
          size="sm"
          items={[
            { label: '수정', icon: Edit },
            {
              label: '삭제',
              icon: Trash2,
              variant: 'destructive',
              onClick: () => handleDelete(row.codeId),
            },
          ]}
        />
      ),
    },
  ];

  const filters = [
    {
      key: 'codeType',
      label: '코드 유형',
      type: 'text' as const,
      placeholder: '코드 유형',
    },
    {
      key: 'codeValue',
      label: '코드 값',
      type: 'text' as const,
      placeholder: '코드 값',
    },
    {
      key: 'codeName',
      label: '코드명',
      type: 'text' as const,
      placeholder: '코드명',
    },
    {
      key: 'isActive',
      label: '상태',
      type: 'select' as const,
      options: [
        { label: '활성', value: 'true' },
        { label: '비활성', value: 'false' },
      ],
    },
  ];

  return (
    <ListPageWrapper<Code, CodeSearchParams>
      title="기초코드 관리"
      description="기초코드를 관리합니다."
      addButtonLabel="코드 추가"
      columns={getColumns}
      api={{
        list: codesApi.list,
        delete: codesApi.delete,
      }}
      filterMapper={createCodeFilterMapper()}
      getEntityId={(code) => code.codeId}
      entityName="기초코드"
      filters={filters}
    />
  );
}
