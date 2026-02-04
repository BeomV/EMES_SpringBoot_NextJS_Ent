import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { Users, ShieldCheck, FileText, Database } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: '전체 사용자',
      value: '1,234',
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: '활성 역할',
      value: '24',
      icon: ShieldCheck,
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: '감사 로그',
      value: '45.2K',
      icon: FileText,
      change: '+1.2K',
      changeType: 'neutral' as const,
    },
    {
      title: '시스템 상태',
      value: '99.9%',
      icon: Database,
      change: '운영 중',
      changeType: 'positive' as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="대시보드"
          description="EMES 플랫폼 - 엔터프라이즈 MES 솔루션"
        />

        {/* 통계 그리드 */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 최근 활동 */}
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 사용자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                최근 활동이 없습니다.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>시스템 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">API 서버</span>
                  <Badge variant="success">온라인</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">데이터베이스</span>
                  <Badge variant="success">연결됨</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">캐시</span>
                  <Badge variant="success">활성</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
