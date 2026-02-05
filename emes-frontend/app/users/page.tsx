'use client';

import { useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn, type DataTableHandle } from '@/components/common/DataTable';
import { SearchInput, type SearchInputFilter, type SearchInputHandle } from '@/components/common/SearchInput';
import { SearchButton } from '@/components/common/SearchButton';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Plus, Edit, Trash2, Lock, Unlock, Key, Save } from 'lucide-react';
import { useListPage } from '@/hooks/list/useListPage';
import { usersApi, createUserFilterMapper } from '@/lib/api/users';
import { formatDate } from '@/lib/utils/format';
import type { User, UserSearchParams } from '@/types/api';

export default function UsersPage() {
  const searchInputRef = useRef<SearchInputHandle>(null);
  const dataTableRef = useRef<DataTableHandle>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // 행 업데이트 핸들러 (편집 모드)
  const handleUpdate = async (user: User) => {
    try {
      await usersApi.updateUser(user.userId, user);
      // 성공 시 목록 재조회
      await handleFilter({});
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  // 일괄 삭제 핸들러 (체크박스 선택)
  const handleBulkDelete = async (users: User[]) => {
    try {
      await Promise.all(users.map(user => usersApi.deleteUser(user.userId)));
      // 성공 시 목록 재조회
      await handleFilter({});
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  };

  // 저장 버튼 핸들러 (편집 모드)
  const handleSaveClick = async () => {
    if (!dataTableRef.current) return;
    try {
      await dataTableRef.current.saveEdit();
      // 성공 시 목록 재조회
      await handleFilter({});
    } catch (error) {
      // 에러는 DataTable에서 이미 처리됨
    }
  };

  // 삭제 버튼 핸들러 (체크박스 선택)
  const handleDeleteClick = async () => {
    if (!dataTableRef.current) return;

    const selectedUsers = dataTableRef.current.getSelectedRows() as User[];
    if (selectedUsers.length === 0) {
      return;
    }

    await handleBulkDelete(selectedUsers);
    dataTableRef.current.clearSelection();
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: '사용자 ID',
      width: '120px',
      allowSort: true,
      allowBlank: false,  // 필수 입력
      render: (_, row) => (
        <span className="font-medium">{row.username}</span>
      ),
    },
    {
      key: 'displayName',
      header: '이름',
      width: '100px',
      allowSort: true,
      allowBlank: false,  // 필수 입력
      render: (_, row) => row.displayName || '-',
    },
    {
      key: 'email',
      header: '이메일',
      allowSort: true,
      allowBlank: false,  // 필수 입력
      render: (_, row) => row.email,
    },
    {
      key: 'department',
      header: '부서',
      width: '100px',
      allowSort: true,
      allowBlank: true,   // 선택 입력
      render: (_, row) => row.department || '-',
    },
    {
      key: 'status',
      header: '상태',
      width: '120px',
      allowSort: true,
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
      allowSort: true,
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

  const searchFilters: SearchInputFilter[] = [
    { key: 'username', label: '사용자 ID', type: 'text', placeholder: '사용자 ID', required: true },
    { key: 'displayName', label: '이름', type: 'text', placeholder: '이름' },
    { key: 'department', label: '부서', type: 'text', placeholder: '부서' },
    {
      key: 'enabled', label: '상태', type: 'select', options: [
        { label: '활성', value: 'true' },
        { label: '비활성', value: 'false' },
      ]
    },
    {
      key: 'accountLocked', label: '잠금', type: 'select', options: [
        { label: '잠김', value: 'true' },
        { label: '정상', value: 'false' },
      ]
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader title="사용자 관리" description="사용자 계정 및 권한을 관리합니다.">
          <div className="flex items-center gap-2">
            <SearchButton
              onSearch={() => searchInputRef.current?.search()}
              onReset={() => searchInputRef.current?.reset()}
            />
            <Button
              size="sm"
              variant="default"
              onClick={handleSaveClick}
              disabled={!isEditing}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              저장
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              삭제
            </Button>
          </div>
        </PageHeader>

        <SearchInput
          ref={searchInputRef}
          filters={searchFilters}
          onFilter={handleFilter}
          grid={{ count: 8 }}
        />

        <DataTable
          ref={dataTableRef}
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="사용자를 찾을 수 없습니다."
          resizableColumns
          editable
          selectable
          onUpdate={handleUpdate}
          onBulkDelete={handleBulkDelete}
          onEditChange={setIsEditing}
          getRowId={(user) => user.userId}
        />
      </div>
    </DashboardLayout>
  );
}
