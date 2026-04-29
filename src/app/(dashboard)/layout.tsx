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
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main area: header + content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader userEmail={user.email ?? ''} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
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
