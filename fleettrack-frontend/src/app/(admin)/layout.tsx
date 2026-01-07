'use client';

import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar role={user?.roleName || 'Admin'} />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
