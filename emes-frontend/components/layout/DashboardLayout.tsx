'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative h-screen overflow-hidden">
      <Sidebar />
      <div className="ml-48 h-screen flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-slate-50 p-3 pt-12">
          <div className="h-full rounded-lg bg-white p-3 shadow-sm">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
