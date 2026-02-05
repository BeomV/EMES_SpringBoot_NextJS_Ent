'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Plus, Edit, Trash2 } from 'lucide-react'; // MoreVertical handled by ActionMenu
import { useListPage } from '@/hooks/list/useListPage';
import { rolesApi, createRoleFilterMapper } from '@/lib/api/roles';
import { formatDate } from '@/lib/utils/format';
import type { Role, RoleSearchParams } from '@/types/entities/role';

export default function RolesPage() {
  // useListPage hook으로 모든 상태와 로직 관리
  const {
    data: roles,
    loading,
    handleFilter,
    handleDelete,
  } = useListPage<Role, RoleSearchParams>({
    api: {
      list: rolesApi.list,
      delete: rolesApi.delete,
    },
    filterMapper: createRoleFilterMapper(),
    getEntityId: (role) => role.roleId,
    entityName: '역할',
  });

  /**
   * 역할 컬럼 정의
   */
  const columns: DataTableColumn<Role>[] = [
    {
      key: 'roleCode',
      header: '역할 코드',
      width: '120px',
      render: (_, row) => <span className="font-medium">{row.roleCode}</span>,
    },
    {
      key: 'roleName',
      header: '역할명',
      width: '150px',
      render: (_, row) => row.roleName,
    },
    {
      key: 'description',
      header: '설명',
      render: (_, row) => row.description || '-',
    },
    {
      key: 'isSystem',
      header: '시스템 역할',
      width: '100px',
      render: (_, row) => (
        <Badge variant={row.isSystem ? 'secondary' : 'outline'}>
          {row.isSystem ? '시스템' : '사용자정의'}
        </Badge>
      ),
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
            { label: '권한 할당', icon: undefined },
            ...(row.isSystem
              ? []
              : [
                  {
                    label: '삭제',
                    icon: Trash2,
                    variant: 'destructive' as const,
                    onClick: () => handleDelete(row.roleId),
                  },
                ]),
          ]}
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader title="역할 관리" description="역할 및 권한을 관리합니다.">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            역할 추가
          </Button>
        </PageHeader>

        <DataTable
          columns={columns}
          data={roles}
          loading={loading}
          emptyMessage="역할을 찾을 수 없습니다."
          filters={[
            {
              key: 'roleCode',
              label: '역할 코드',
              type: 'text',
              placeholder: '역할 코드',
            },
            {
              key: 'roleName',
              label: '역할명',
              type: 'text',
              placeholder: '역할명',
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
