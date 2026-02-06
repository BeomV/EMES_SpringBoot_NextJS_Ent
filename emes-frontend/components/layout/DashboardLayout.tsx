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
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        expand
        duration={3000}
        visibleToasts={3}
        toastOptions={{
          classNames: {
            toast: 'rounded-sm shadow-xl border bg-white',
            title: 'text-base font-semibold text-gray-900',
            description: 'text-sm text-gray-500 mt-0.5',
            actionButton: 'bg-primary text-primary-foreground rounded-sm',
            cancelButton: 'bg-muted text-muted-foreground rounded-sm',
            closeButton: 'text-gray-400 hover:text-gray-600 transition-colors',
            icon: 'w-6 h-6',
            success: 'border-l-4 border-l-green-500 bg-white',
            error: 'border-l-4 border-l-red-500 bg-white',
            warning: 'border-l-4 border-l-yellow-500 bg-white',
            info: 'border-l-4 border-l-blue-500 bg-white',
          },
        }}
      />
    </div>
  );
}
