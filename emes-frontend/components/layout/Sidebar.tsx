'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  ShieldCheck,
  Key,
  FileText,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubMenuItem {
  title: string;
  href: string;
}

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: '대시보드',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: '사용자 관리',
    icon: Users,
    children: [
      { title: '사용자 목록', href: '/users' },
      { title: '사용자 그룹', href: '/user-groups' },
    ],
  },
  {
    title: '접근 권한',
    icon: ShieldCheck,
    children: [
      { title: '역할 관리', href: '/roles' },
      { title: '권한 관리', href: '/permissions' },
    ],
  },
  {
    title: '시스템 관리',
    icon: Key,
    children: [
      { title: '기초코드', href: '/codes' },
      { title: '메뉴 관리', href: '/menus' },
      { title: '다국어 관리', href: '/i18n' },
    ],
  },
  {
    title: '모니터링',
    icon: FileText,
    children: [
      { title: '감사 로그', href: '/audit-logs' },
      { title: '메타데이터', href: '/metadata' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const getInitialOpenMenus = (): Record<string, boolean> => {
    const openMenus: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (isChildActive) {
          openMenus[item.title] = true;
        }
      }
    });
    return openMenus;
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(getInitialOpenMenus);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (isChildActive) {
          setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [pathname]);

  const handleToggle = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const hasActiveChild = (children: SubMenuItem[]) => {
    return children.some((child) => isActive(child.href));
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* 로고 */}
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">E</span>
            </div>
            <span className="text-lg">EMES Platform</span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.title)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                        item.children && hasActiveChild(item.children)
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'font-medium text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          openMenus[item.title] && 'rotate-180'
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-200 ease-in-out',
                        openMenus[item.title]
                          ? 'max-h-96 opacity-100'
                          : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="mt-0.5 space-y-0.5 pl-10">
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block rounded-md px-3 py-1.5 text-sm transition-colors',
                              isActive(child.href)
                                ? 'font-medium text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* 하단 정보 */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <div className="font-semibold">EMES Platform</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
