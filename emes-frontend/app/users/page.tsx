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
import { apiClient } from '@/lib/api/client';
import { Loader2, Database, Server } from 'lucide-react';
import type { User, UserSearchParams } from '@/types/api';

export default function UsersPage() {
  const searchInputRef = useRef<SearchInputHandle>(null);
  const dataTableRef = useRef<DataTableHandle>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  // 대용량 테스트 모드
  const [testMode, setTestMode] = useState(false);
  const [dummyData, setDummyData] = useState<User[]>([]);
  const [dummyLoading, setDummyLoading] = useState(false);
  const [dummyCount, setDummyCount] = useState(10000);
  const [fetchTime, setFetchTime] = useState<number | null>(null);

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

  // 로컬 더미 데이터 생성 함수
  const generateLocalData = (count: number): User[] => {
    const departments = ['개발팀', '영업팀', '마케팅팀', '인사팀', '재무팀', '기획팀', '생산팀', '품질팀'];
    const positions = ['사원', '주임', '대리', '과장', '차장', '부장'];
    const now = new Date();

    return Array.from({ length: count }, (_, i) => ({
      userId: i + 1,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      displayName: `테스트사용자${i + 1}`,
      phoneNumber: `010-${String(i % 10000).padStart(4, '0')}-${String(Math.floor(i / 10000) % 10000).padStart(4, '0')}`,
      department: departments[i % departments.length],
      position: positions[i % positions.length],
      enabled: i % 10 !== 0,
      accountLocked: i % 50 === 0,
      lastLoginAt: new Date(now.getTime() - (i % 30) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - (i % 365) * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin',
      updatedAt: new Date(now.getTime() - (i % 30) * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  // 더미 데이터 가져오기 (1M 이상은 로컬 생성)
  const fetchDummyData = async (count: number) => {
    setDummyLoading(true);
    setFetchTime(null);
    const startTime = performance.now();

    try {
      // 100만건 이상은 로컬에서 생성 (서버 메모리/네트워크 한계)
      if (count >= 1000000) {
        const localData = generateLocalData(count);
        const endTime = performance.now();
        setFetchTime(endTime - startTime);
        setDummyData(localData);
        setDummyCount(count);
        return;
      }

      const response = await apiClient.get(`/admin/users/dummy?count=${count}`);
      const endTime = performance.now();
      setFetchTime(endTime - startTime);

      // API 응답을 User 타입에 맞게 매핑
      const mappedData: User[] = response.data.data.map((item: any) => ({
        userId: item.userId,
        username: item.username,
        email: item.email,
        displayName: item.displayName,
        phoneNumber: item.phoneNumber,
        department: item.department,
        position: item.position,
        enabled: item.enabled,
        accountLocked: item.accountLocked,
        lastLoginAt: item.lastLoginAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setDummyData(mappedData);
      setDummyCount(count);
    } catch (error) {
      console.error('Failed to fetch dummy data:', error);
      // 서버 실패 시 로컬 생성으로 폴백
      const localData = generateLocalData(count);
      const endTime = performance.now();
      setFetchTime(endTime - startTime);
      setDummyData(localData);
      setDummyCount(count);
    } finally {
      setDummyLoading(false);
    }
  };

  // 테스트 모드 토글
  const toggleTestMode = () => {
    if (!testMode) {
      // 테스트 모드 진입 시 더미 데이터 로드
      fetchDummyData(dummyCount);
    }
    setTestMode(!testMode);
  };

  // 신규
  const NewClick = async () => {
    console.log('New row');
  };

  // 조회
  const QueryClick = async () => {
    if (testMode) {
      fetchDummyData(dummyCount);
      return;
    }

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
      if (!testMode) {
        await refresh();
      }
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

    if (testMode) {
      // 테스트 모드에서는 로컬에서만 삭제
      const selectedIds = new Set(selectedUsers.map(u => u.userId));
      setDummyData(prev => prev.filter(u => !selectedIds.has(u.userId)));
      dataTableRef.current.clearSelection();
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
    if (testMode) {
      // 테스트 모드에서는 로컬에서만 업데이트
      setDummyData(prev => prev.map(u => u.userId === user.userId ? user : u));
      return;
    }

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
    if (testMode) {
      const selectedIds = new Set(users.map(u => u.userId));
      setDummyData(prev => prev.filter(u => !selectedIds.has(u.userId)));
      return;
    }

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

  // 현재 표시할 데이터
  const displayData = testMode ? dummyData : users;
  const isLoading = testMode ? dummyLoading : loading;

  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: '사용자 ID',
      width: '120px',
      allowSort: true,
      allowBlank: true,
      render: (_, row) => (
        <span className="font-medium">{row.username}</span>
      ),
    },
    {
      key: 'displayName',
      header: '이름',
      width: '100px',
      allowSort: true,
      allowBlank: false,
      render: (_, row) => row.displayName || '-',
    },
    {
      key: 'email',
      header: '이메일',
      allowSort: true,
      allowBlank: false,
      render: (_, row) => row.email,
    },
    {
      key: 'department',
      header: '부서',
      width: '100px',
      allowSort: true,
      allowBlank: true,
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
          <div className="flex items-center gap-3">
            {/* 대용량 테스트 토글 */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
              <Button
                size="sm"
                variant={!testMode ? 'default' : 'ghost'}
                onClick={() => setTestMode(false)}
                className="h-5 px-2 text-[9px] gap-1"
              >
                <Database className="h-2.5 w-2.5" />
                실제 DB
              </Button>
              <Button
                size="sm"
                variant={testMode ? 'default' : 'ghost'}
                onClick={toggleTestMode}
                className="h-5 px-2 text-[9px] gap-1"
              >
                <Server className="h-2.5 w-2.5" />
                대용량 테스트
              </Button>
            </div>

            {/* 테스트 모드 데이터 개수 선택 */}
            {testMode && (
              <div className="flex items-center gap-1">
                {[10000, 100000, 500000, 1000000].map((count) => (
                  <Button
                    key={count}
                    size="sm"
                    variant={dummyCount === count ? 'default' : 'outline'}
                    onClick={() => fetchDummyData(count)}
                    className="h-5 px-2 text-[9px]"
                    disabled={dummyLoading}
                    title={count >= 1000000 ? '로컬 생성 (브라우저)' : '서버 API'}
                  >
                    {count >= 1000000 ? `${count / 1000000}M` : `${count / 1000}K`}
                  </Button>
                ))}
              </div>
            )}

            <div className="w-px h-4 bg-gray-300" />

            {/* 기본 버튼들 */}
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
          </div>
        </PageHeader>

        {/* 테스트 모드 정보 표시 */}
        {testMode && (
          <div className="flex items-center gap-4 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-[10px]">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-amber-900">테스트 모드</span>
              {dummyLoading && <Loader2 className="h-3 w-3 animate-spin text-amber-600" />}
            </div>
            <div>
              <span className="text-amber-700">소스: </span>
              <span className="font-semibold text-amber-900">{dummyCount >= 1000000 ? '로컬 생성' : '서버 API'}</span>
            </div>
            <div>
              <span className="text-amber-700">데이터: </span>
              <span className="font-semibold text-amber-900">{displayData.length.toLocaleString()}개</span>
            </div>
            {fetchTime !== null && (
              <div>
                <span className="text-amber-700">생성 시간: </span>
                <span className="font-semibold text-amber-900">{(fetchTime / 1000).toFixed(2)}초</span>
              </div>
            )}
            <div className="text-amber-600">
              * {dummyCount >= 1000000 ? '1M 이상은 브라우저에서 직접 생성' : '더미 데이터로 편집/삭제는 로컬에서만 적용'}
            </div>
          </div>
        )}

        <SearchInput
          ref={searchInputRef}
          filters={searchFilters}
          onFilter={QueryClick}
          grid={{ count: 8 }}
        />

        <div className="flex-1 min-h-0 relative">
          {/* 로딩 스피너 (배경 투명) */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg shadow-md">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-gray-700">
                  {testMode ? `${dummyCount.toLocaleString()}개 데이터 생성 중...` : '로딩 중...'}
                </span>
              </div>
            </div>
          )}
          <DataTable
            ref={dataTableRef}
            title={testMode ? `사용자 목록 (테스트 - ${displayData.length.toLocaleString()}개)` : '사용자 목록'}
            columns={columns}
            data={displayData}
            loading={isLoading}
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
