'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Plus, Edit, Trash2, Lock, Unlock, Key } from 'lucide-react';
import { useListPage } from '@/hooks/list/useListPage';
import { usersApi, createUserFilterMapper } from '@/lib/api/users';
import { formatDate } from '@/lib/utils/format';
import type { User, UserSearchParams } from '@/types/api';

export default function UsersPage() {
  // 모든 상태와 로직이 통합된 hook 하나로!
  const {
    data: users,
    loading,
    handleFilter,
    handleDelete,
    handleCustomAction,
  } = useListPage<User, UserSearchParams>({
    api: {
      list: usersApi.getUsers,
      delete: usersApi.deleteUser,
      customActions: {
        lock: usersApi.lockAccount,
        unlock: usersApi.unlockAccount,
      },
    },
    filterMapper: createUserFilterMapper(),
    getEntityId: (user) => user.userId,
    entityName: '사용자',
  });

  // 잠금/해제 토글 (간결해짐)
  const handleLockToggle = (user: User) => {
    const action = user.accountLocked ? 'unlock' : 'lock';
    handleCustomAction(action, user.userId);
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: '사용자 ID',
      width: '120px',
      render: (_, row) => (
        <span className="font-medium">{row.username}</span>
      ),
    },
    {
      key: 'displayName',
      header: '이름',
      width: '100px',
      render: (_, row) => row.displayName || '-',
    },
    {
      key: 'email',
      header: '이메일',
      render: (_, row) => row.email,
    },
    {
      key: 'department',
      header: '부서',
      width: '100px',
      render: (_, row) => row.department || '-',
    },
    {
      key: 'status',
      header: '상태',
      width: '120px',
      render: (_, row) => (
        <div className="flex gap-1">
          <Badge variant={row.enabled ? 'success' : 'secondary'}>
            {row.enabled ? '활성' : '비활성'}
          </Badge>
          {row.accountLocked && (
            <Badge variant="destructive">잠김</Badge>
          )}
        </div>
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
            { label: '비밀번호 변경', icon: Key },
            {
              label: row.accountLocked ? '잠금 해제' : '계정 잠금',
              icon: row.accountLocked ? Unlock : Lock,
              onClick: () => handleLockToggle(row),
            },
            {
              label: '삭제',
              icon: Trash2,
              variant: 'destructive',
              onClick: () => handleDelete(row.userId),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader title="사용자 관리" description="사용자 계정 및 권한을 관리합니다.">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            사용자 추가
          </Button>
        </PageHeader>

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="사용자를 찾을 수 없습니다."
          filters={[
            { key: 'username', label: '사용자 ID', type: 'text', placeholder: '사용자 ID' },
            { key: 'displayName', label: '이름', type: 'text', placeholder: '이름' },
            { key: 'department', label: '부서', type: 'text', placeholder: '부서' },
            { key: 'enabled', label: '상태', type: 'select', options: [
              { label: '활성', value: 'true' },
              { label: '비활성', value: 'false' },
            ]},
            { key: 'accountLocked', label: '잠금', type: 'select', options: [
              { label: '잠김', value: 'true' },
              { label: '정상', value: 'false' },
            ]},
          ]}
          onFilter={handleFilter}
          resizableColumns
        />
      </div>
    </DashboardLayout>
  );
}
