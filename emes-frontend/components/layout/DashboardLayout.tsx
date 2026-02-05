'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6 pt-20">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
