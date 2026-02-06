'use client';

import { useRef, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn, type DataTableHandle } from '@/components/common/DataTable';
import { SearchInput, type SearchInputFilter, type SearchInputHandle } from '@/components/common/SearchInput';
import { useListPage } from '@/hooks/list/useListPage';
import { userService } from '@/services/UserService';
import { createUserFilterMapper } from '@/lib/api/users';
import { formatDate } from '@/lib/utils/format';
import type { User, UserSearchParams } from '@/types/api';

export default function UsersPage() {
  const searchInputRef = useRef<SearchInputHandle>(null);
  const dataTableRef = useRef<DataTableHandle>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  // 안정적인 API 함수 참조 (useCallback으로 메모이제이션)
  const getUsersApi = useCallback(
    (params: UserSearchParams) => userService.getUsers(params),
    []
  );

  // 데이터 상태 관리
  const {
    data: users,
    loading,
    refresh,
  } = useListPage<User, UserSearchParams>({
    api: {
      list: getUsersApi,
    },
    filterMapper: createUserFilterMapper(),
    getEntityId: (user) => user.userId,
    entityName: '사용자',
  });

  // 신규
  const NewClick = async () => {
    // TODO: 새 행 추가 로직 구현
    console.log('New row');
  };

  // 조회
  const QueryClick = async () => {
    const filterMapper = createUserFilterMapper();
    const filterValues = searchInputRef.current?.getValues() || {};
    const mappedFilters = filterMapper(filterValues);

    try {
      await userService.getUsers(mappedFilters as UserSearchParams);
      await refresh();
    } catch (error) {
      console.error('Query error:', error);
    }
  };

  // 저장
  const SaveClick = async () => {
    if (!dataTableRef.current) return;

    try {
      await dataTableRef.current.saveEdit();
      await refresh();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // 삭제
  const DeleteClick = async () => {
    if (!dataTableRef.current) return;

    const selectedUsers = dataTableRef.current.getSelectedRows() as User[];
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      await Promise.all(
        selectedUsers.map(user => userService.deleteUser(user.userId))
      );
      await refresh();
      dataTableRef.current.clearSelection();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // 행 업데이트 (편집 모드)
  const handleUpdate = async (user: User) => {
    try {
      await userService.updateUser(user.userId, user);
      await refresh();
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };

  // 일괄 삭제 (내부용)
  const handleBulkDelete = async (users: User[]) => {
    try {
      await Promise.all(
        users.map(user => userService.deleteUser(user.userId))
      );
      await refresh();
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: '사용자 ID',
      width: '120px',
      allowSort: true,
      allowBlank: true,  // 필수 입력
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
      width: '200px',
      allowSort: true,
      render: (_, row) => (
        <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  const searchFilters: SearchInputFilter[] = [
    { key: 'username', label: '사용자 ID', type: 'text', placeholder: '사용자 ID'},
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
      <div className="h-full flex flex-col gap-3">
        <PageHeader title="사용자 관리" description="사용자 계정 및 권한을 관리합니다.">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={NewClick}
              className="h-6 px-3 text-[10px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 rounded-md shadow-sm transition-colors"
            >
              신규
            </Button>
            <Button
              size="sm"
              onClick={QueryClick}
              className="h-6 px-3 text-[10px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 rounded-md shadow-sm transition-colors"
            >
              조회
            </Button>
            <Button
              size="sm"
              onClick={SaveClick}
              disabled={!isEditing}
              className="h-6 px-3 text-[10px] bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 rounded-md shadow-sm transition-colors"
            >
              저장
            </Button>
            <Button
              size="sm"
              onClick={DeleteClick}
              disabled={selectedCount === 0}
              className="h-6 px-3 text-[10px] bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 rounded-md shadow-sm transition-colors"
            >
              삭제
            </Button>
          </div>
        </PageHeader>

        <SearchInput
          ref={searchInputRef}
          filters={searchFilters}
          onFilter={QueryClick}
          grid={{ count: 8 }}
        />

        <div className="flex-1 min-h-0">
          <DataTable
            ref={dataTableRef}
            title="사용자 목록"
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
            onSelectionChange={(rows) => setSelectedCount(rows.length)}
            getRowId={(user) => user.userId}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
