import { requireUser } from '@/lib/supabase/auth';
import { getAccounts, getCategories } from '@/lib/db/queries';
import { Sidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { QuickAddFab } from '@/components/layout/quick-add-fab';
import { QuickAddSheet } from '@/components/layout/quick-add-sheet';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Ambient background glow orbs */}
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          top: '-10%', left: '10%', width: 500, height: 500,
          background: 'radial-gradient(circle, oklch(0.75 0.18 140 / 0.06), transparent 70%)',
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          bottom: '-5%', right: '5%', width: 400, height: 400,
          background: 'radial-gradient(circle, oklch(0.63 0.25 15 / 0.05), transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main area: header + content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <AppHeader userEmail={user.email ?? ''} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Quick Add floating button */}
      <QuickAddFab />

      {/* Quick Add slide-over sheet */}
      <QuickAddSheet accounts={accounts} categories={categories} />
    </div>
  );
}
