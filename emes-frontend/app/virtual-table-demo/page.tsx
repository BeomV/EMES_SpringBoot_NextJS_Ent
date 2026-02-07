'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VirtualDataTable, type VirtualDataTableColumn } from '@/components/common/VirtualDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { Loader2, Server, Monitor } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

// 대용량 테스트 데이터 타입 (서버 응답과 일치)
interface UserData {
  userId: number;
  username: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  department: string;
  position: string;
  enabled: boolean;
  accountLocked: boolean;
  lastLoginAt: string;
  createdAt: string;
}

// 대량 로컬 데이터 생성 함수
function generateLocalData(count: number): UserData[] {
  const departments = ['개발팀', '영업팀', '마케팅팀', '인사팀', '재무팀', '기획팀', '생산팀', '품질팀'];
  const positions = ['사원', '주임', '대리', '과장', '차장', '부장'];

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
    lastLoginAt: new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - (i % 365) * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export default function VirtualTableDemoPage() {
  const [dataSize, setDataSize] = useState(10000);
  const [selectedRows, setSelectedRows] = useState<UserData[]>([]);
  const [tableHeight, setTableHeight] = useState(600);
  const [dataSource, setDataSource] = useState<'local' | 'server'>('local');
  const [serverData, setServerData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchTime, setFetchTime] = useState<number | null>(null);

  // 클라이언트에서만 window 객체 사용
  React.useEffect(() => {
    setTableHeight(window.innerHeight - 300);
  }, []);

  // 로컬 대용량 데이터 생성 (메모이제이션)
  const localData = useMemo(() => generateLocalData(dataSize), [dataSize]);

  // 서버에서 데이터 가져오기
  const fetchServerData = useCallback(async (count: number) => {
    setLoading(true);
    setFetchTime(null);
    const startTime = performance.now();

    try {
      const response = await apiClient.get(`/admin/users/dummy?count=${count}`);
      const endTime = performance.now();
      setFetchTime(endTime - startTime);
      setServerData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dummy users:', error);
      setServerData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 데이터 소스 변경 시 서버 데이터 가져오기
  React.useEffect(() => {
    if (dataSource === 'server') {
      fetchServerData(dataSize);
    }
  }, [dataSource, dataSize, fetchServerData]);

  // 현재 표시할 데이터
  const data = dataSource === 'local' ? localData : serverData;

  const columns: VirtualDataTableColumn<UserData>[] = [
    {
      key: 'userId',
      header: 'ID',
      width: 80,
      allowSort: true,
      align: 'center',
    },
    {
      key: 'username',
      header: '사용자명',
      width: 120,
      allowSort: true,
      editable: true,
    },
    {
      key: 'displayName',
      header: '이름',
      width: 120,
      allowSort: true,
      editable: true,
    },
    {
      key: 'email',
      header: '이메일',
      width: 200,
      allowSort: true,
      editable: true,
    },
    {
      key: 'department',
      header: '부서',
      width: 100,
      allowSort: true,
      editable: true,
    },
    {
      key: 'position',
      header: '직급',
      width: 80,
      allowSort: true,
    },
    {
      key: 'phoneNumber',
      header: '전화번호',
      width: 130,
      align: 'center',
    },
    {
      key: 'enabled',
      header: '상태',
      width: 80,
      align: 'center',
      allowSort: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? '활성' : '비활성'}
        </Badge>
      ),
    },
    {
      key: 'accountLocked',
      header: '잠금',
      width: 70,
      align: 'center',
      render: (value) => (
        <Badge variant={value ? 'destructive' : 'outline'}>
          {value ? '잠금' : '정상'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: '생성일',
      width: 100,
      allowSort: true,
      align: 'center',
      render: (value) => {
        if (!value) return '-';
        return new Date(value as string).toLocaleDateString('ko-KR');
      },
    },
  ];

  const handleUpdate = async (row: UserData) => {
    console.log('Update row:', row);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleDataSizeChange = (size: number) => {
    setDataSize(size);
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col gap-3">
        <PageHeader
          title="대용량 데이터 테이블 데모"
          description="가상 스크롤링을 사용한 고성능 테이블 (@tanstack/react-virtual)"
        >
          <div className="flex items-center gap-4">
            {/* 데이터 소스 토글 */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
              <Button
                size="sm"
                variant={dataSource === 'local' ? 'default' : 'ghost'}
                onClick={() => setDataSource('local')}
                className="h-6 px-2 text-[10px] gap-1"
              >
                <Monitor className="h-3 w-3" />
                로컬
              </Button>
              <Button
                size="sm"
                variant={dataSource === 'server' ? 'default' : 'ghost'}
                onClick={() => setDataSource('server')}
                className="h-6 px-2 text-[10px] gap-1"
              >
                <Server className="h-3 w-3" />
                서버
              </Button>
            </div>

            {/* 데이터 개수 선택 */}
            <div className="flex items-center gap-1">
              {[1000, 10000, 100000, 1000000].map((size) => (
                <Button
                  key={size}
                  size="sm"
                  variant={dataSize === size ? 'default' : 'outline'}
                  onClick={() => handleDataSizeChange(size)}
                  className="h-6 px-2 text-[10px]"
                  disabled={loading}
                >
                  {size.toLocaleString()}개
                </Button>
              ))}
            </div>
          </div>
        </PageHeader>

        {/* 성능 정보 */}
        <div className="flex items-center gap-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-xs">
          <div>
            <span className="font-semibold text-blue-900">데이터 소스:</span>{' '}
            <span className="text-blue-700">{dataSource === 'local' ? '로컬 생성' : '서버 API'}</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900">총 데이터:</span>{' '}
            <span className="text-blue-700">{data.length.toLocaleString()}개</span>
          </div>
          {fetchTime !== null && dataSource === 'server' && (
            <div>
              <span className="font-semibold text-blue-900">API 응답 시간:</span>{' '}
              <span className="text-blue-700">{(fetchTime / 1000).toFixed(2)}초</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-blue-900">선택된 행:</span>{' '}
            <span className="text-blue-700">{selectedRows.length}개</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900">렌더링:</span>{' '}
            <span className="text-blue-700">가상 스크롤링 (약 20-30행만 렌더링)</span>
          </div>
        </div>

        {/* Virtual Table */}
        <div className="flex-1 min-h-0 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                서버에서 {dataSize.toLocaleString()}개 데이터 로딩 중...
              </div>
            </div>
          )}
          <VirtualDataTable
            title={`사용자 목록 (${dataSource === 'local' ? '로컬' : '서버'} - ${data.length.toLocaleString()}개)`}
            columns={columns}
            data={data}
            rowHeight={36}
            height={tableHeight}
            selectable
            editable
            onUpdate={handleUpdate}
            onSelectionChange={setSelectedRows}
            getRowId={(row) => row.userId}
            emptyMessage="데이터가 없습니다."
          />
        </div>

        {/* 설명 */}
        <div className="px-3 py-2 bg-slate-50 border rounded-md text-[10px] text-slate-600">
          <div className="font-semibold mb-1">💡 테스트 방법:</div>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li><strong>로컬:</strong> 브라우저에서 직접 더미 데이터 생성 (즉시)</li>
            <li><strong>서버:</strong> Spring Boot API에서 더미 데이터 생성 후 전송 (네트워크 지연 포함)</li>
            <li>100만 개 데이터도 가상 스크롤링으로 부드럽게 렌더링</li>
            <li>서버 모드에서는 실제 JSON 직렬화 및 네트워크 전송 시간 측정 가능</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
