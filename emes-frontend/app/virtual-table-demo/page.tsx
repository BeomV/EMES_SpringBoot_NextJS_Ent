'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VirtualDataTable, type VirtualDataTableColumn } from '@/components/common/VirtualDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';

// 대용량 테스트 데이터 타입
interface TestData {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
}

// 대량 데이터 생성 함수
function generateMockData(count: number): TestData[] {
  const departments = ['개발팀', '영업팀', '마케팅팀', '인사팀', '재무팀', '기획팀'];
  const positions = ['사원', '주임', '대리', '과장', '차장', '부장'];
  const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'inactive', 'pending'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `사용자${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: departments[i % departments.length],
    position: positions[i % positions.length],
    salary: Math.floor(Math.random() * 50000000) + 30000000,
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
    status: statuses[i % statuses.length],
  }));
}

export default function VirtualTableDemoPage() {
  const [dataSize, setDataSize] = useState(10000);
  const [selectedRows, setSelectedRows] = useState<TestData[]>([]);
  const [tableHeight, setTableHeight] = useState(600);

  // 클라이언트에서만 window 객체 사용
  React.useEffect(() => {
    setTableHeight(window.innerHeight - 280);
  }, []);

  // 대용량 데이터 생성 (메모이제이션)
  const data = useMemo(() => generateMockData(dataSize), [dataSize]);

  const columns: VirtualDataTableColumn<TestData>[] = [
    {
      key: 'id',
      header: 'ID',
      width: 80,
      allowSort: true,
      align: 'center',
    },
    {
      key: 'name',
      header: '이름',
      width: 120,
      allowSort: true,
      editable: true,
    },
    {
      key: 'email',
      header: '이메일',
      width: 220,
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
      key: 'salary',
      header: '연봉',
      width: 120,
      align: 'right',
      allowSort: true,
      render: (value) => {
        const salary = value as number;
        return (
          <span className="font-semibold">
            {salary.toLocaleString()}원
          </span>
        );
      },
    },
    {
      key: 'joinDate',
      header: '입사일',
      width: 120,
      allowSort: true,
      align: 'center',
    },
    {
      key: 'status',
      header: '상태',
      width: 100,
      align: 'center',
      allowSort: true,
      render: (value) => {
        const status = value as 'active' | 'inactive' | 'pending';
        return (
          <Badge
            variant={
              status === 'active' ? 'success' : status === 'inactive' ? 'secondary' : 'default'
            }
          >
            {status === 'active' ? '활성' : status === 'inactive' ? '비활성' : '대기'}
          </Badge>
        );
      },
    },
  ];

  const handleUpdate = async (row: TestData) => {
    console.log('Update row:', row);
    // 실제로는 API 호출
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
          description="가상 스크롤링을 사용한 고성능 테이블 (react-window)"
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={dataSize === 1000 ? 'default' : 'outline'}
              onClick={() => handleDataSizeChange(1000)}
              className="h-6 px-3 text-[10px]"
            >
              1,000개
            </Button>
            <Button
              size="sm"
              variant={dataSize === 10000 ? 'default' : 'outline'}
              onClick={() => handleDataSizeChange(10000)}
              className="h-6 px-3 text-[10px]"
            >
              10,000개
            </Button>
            <Button
              size="sm"
              variant={dataSize === 100000 ? 'default' : 'outline'}
              onClick={() => handleDataSizeChange(100000)}
              className="h-6 px-3 text-[10px]"
            >
              100,000개
            </Button>
            <Button
              size="sm"
              variant={dataSize === 1000000 ? 'default' : 'outline'}
              onClick={() => handleDataSizeChange(1000000)}
              className="h-6 px-3 text-[10px]"
            >
              1,000,000개
            </Button>
          </div>
        </PageHeader>

        {/* 성능 정보 */}
        <div className="flex items-center gap-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-xs">
          <div>
            <span className="font-semibold text-blue-900">총 데이터:</span>{' '}
            <span className="text-blue-700">{data.length.toLocaleString()}개</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900">선택된 행:</span>{' '}
            <span className="text-blue-700">{selectedRows.length}개</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900">렌더링 방식:</span>{' '}
            <span className="text-blue-700">가상 스크롤링 (Virtual Scrolling)</span>
          </div>
          <div>
            <span className="font-semibold text-blue-900">실제 DOM 렌더링:</span>{' '}
            <span className="text-blue-700">약 20-30개 행만 렌더링</span>
          </div>
        </div>

        {/* Virtual Table */}
        <div className="flex-1 min-h-0">
          <VirtualDataTable
            title="사원 목록 (가상 스크롤링)"
            columns={columns}
            data={data}
            rowHeight={40}
            height={tableHeight}
            selectable
            editable
            onUpdate={handleUpdate}
            onSelectionChange={setSelectedRows}
            getRowId={(row) => row.id}
            emptyMessage="데이터가 없습니다."
          />
        </div>

        {/* 설명 */}
        <div className="px-3 py-2 bg-slate-50 border rounded-md text-[10px] text-slate-600">
          <div className="font-semibold mb-1">💡 가상 스크롤링 (Virtual Scrolling) 특징:</div>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>100만 개 데이터도 부드럽게 스크롤 가능</li>
            <li>화면에 보이는 영역만 렌더링하여 메모리 효율적</li>
            <li>행 더블클릭으로 편집 모드 진입 (다중 편집 가능)</li>
            <li>정렬, 선택, 편집 모두 지원</li>
            <li>고정 행 높이 사용 (성능 최적화)</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
