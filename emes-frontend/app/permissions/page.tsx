'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useListPage } from '@/hooks/list/useListPage';
import { permissionsApi, createPermissionFilterMapper } from '@/lib/api/permissions';
import { formatDate } from '@/lib/utils/format';
import type { Permission, PermissionSearchParams } from '@/types/entities/permission';

export default function PermissionsPage() {
  // useListPage hook으로 모든 상태와 로직 관리
  const {
    data: permissions,
    loading,
    handleFilter,
    handleDelete,
  } = useListPage<Permission, PermissionSearchParams>({
    api: {
      list: permissionsApi.list,
      delete: permissionsApi.delete,
    },
    filterMapper: createPermissionFilterMapper(),
    getEntityId: (permission) => permission.permissionId,
    entityName: '권한',
  });

  /**
   * 권한 컬럼 정의
   */
  const columns: DataTableColumn<Permission>[] = [
    {
      key: 'permissionCode',
      header: '권한 코드',
      width: '150px',
      render: (_, row) => <span className="font-medium">{row.permissionCode}</span>,
    },
    {
      key: 'permissionName',
      header: '권한명',
      width: '150px',
      render: (_, row) => row.permissionName,
    },
    {
      key: 'resource',
      header: '리소스',
      width: '120px',
      render: (_, row) => (
        <Badge variant="outline" className="font-mono">
          {row.resource}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: '액션',
      width: '100px',
      render: (_, row) => (
        <Badge
          variant={
            row.action === 'READ'
              ? 'secondary'
              : row.action === 'WRITE'
                ? 'default'
                : 'destructive'
          }
        >
          {row.action}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: '설명',
      render: (_, row) => row.description || '-',
    },
    {
      key: 'isActive',
      header: '상태',
      width: '100px',
      render: (_, row) => (
        <Badge variant={row.isActive ? 'success' : 'secondary'}>
          {row.isActive ? '활성' : '비활성'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: '등록일',
      width: '100px',
      render: (_, row) => (
        <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '40px',
      align: 'center',
      resizable: false,
      render: (_, row) => (
        <ActionMenu
          size="sm"
          items={[
            { label: '수정', icon: Edit },
            {
              label: '삭제',
              icon: Trash2,
              variant: 'destructive',
              onClick: () => handleDelete(row.permissionId),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader title="권한 관리" description="권한을 관리합니다.">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            권한 추가
          </Button>
        </PageHeader>

        <DataTable
          columns={columns}
          data={permissions}
          loading={loading}
          emptyMessage="권한을 찾을 수 없습니다."
          filters={[
            {
              key: 'permissionCode',
              label: '권한 코드',
              type: 'text',
              placeholder: '권한 코드',
            },
            {
              key: 'permissionName',
              label: '권한명',
              type: 'text',
              placeholder: '권한명',
            },
            {
              key: 'resource',
              label: '리소스',
              type: 'text',
              placeholder: '리소스',
            },
            {
              key: 'action',
              label: '액션',
              type: 'select',
              options: [
                { label: 'READ', value: 'READ' },
                { label: 'WRITE', value: 'WRITE' },
                { label: 'DELETE', value: 'DELETE' },
              ],
            },
            {
              key: 'isActive',
              label: '상태',
              type: 'select',
              options: [
                { label: '활성', value: 'true' },
                { label: '비활성', value: 'false' },
              ],
            },
          ]}
          onFilter={handleFilter}
          resizableColumns
        />
      </div>
    </DashboardLayout>
  );
}
