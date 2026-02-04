'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Key,
} from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import type { User, UserSearchParams } from '@/types/api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    size: 9999,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUsers(searchParams);
      setUsers(response.data.content);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilter = (filters: Record<string, string>) => {
    setSearchParams((prev) => ({
      ...prev,
      username: filters.username || undefined,
      displayName: filters.displayName || undefined,
      department: filters.department || undefined,
      enabled: filters.enabled ? filters.enabled === 'true' : undefined,
      accountLocked: filters.accountLocked ? filters.accountLocked === 'true' : undefined,
    }));
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('이 사용자를 삭제하시겠습니까?')) return;
    try {
      await usersApi.deleteUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleLockToggle = async (user: User) => {
    try {
      if (user.accountLocked) {
        await usersApi.unlockAccount(user.userId);
      } else {
        await usersApi.lockAccount(user.userId);
      }
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle account lock:', error);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-3.5 w-3.5" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Key className="mr-2 h-3.5 w-3.5" />
              비밀번호 변경
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLockToggle(row)}>
              {row.accountLocked ? (
                <>
                  <Unlock className="mr-2 h-3.5 w-3.5" />
                  잠금 해제
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-3.5 w-3.5" />
                  계정 잠금
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.userId)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
