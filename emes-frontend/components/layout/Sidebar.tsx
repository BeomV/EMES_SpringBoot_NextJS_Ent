'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Key,
  FolderTree,
  Menu as MenuIcon,
  Code,
  FileText,
  Globe,
  Database,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    icon: Users,
    children: [
      { title: 'Users', href: '/users' },
      { title: 'User Groups', href: '/user-groups' },
    ],
  },
  {
    title: 'Access Control',
    icon: ShieldCheck,
    children: [
      { title: 'Roles', href: '/roles' },
      { title: 'Permissions', href: '/permissions' },
    ],
  },
  {
    title: 'System',
    icon: Key,
    children: [
      { title: 'Codes', href: '/codes' },
      { title: 'Menus', href: '/menus' },
      { title: 'I18n', href: '/i18n' },
    ],
  },
  {
    title: 'Monitoring',
    icon: FileText,
    children: [
      { title: 'Audit Logs', href: '/audit-logs' },
      { title: 'Metadata', href: '/metadata' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">E</span>
            </div>
            <span className="text-lg">EMES Platform</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                      pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ) : (
                  <>
                    <div className="mb-1 mt-4 flex items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                    <div className="ml-7 space-y-1">
                      {item.children?.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href}
                          className={cn(
                            'block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                            pathname === child.href
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
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
