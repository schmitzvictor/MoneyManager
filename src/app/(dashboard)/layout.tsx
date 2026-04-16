import { requireUser } from '@/lib/supabase/auth';
import { logout } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Temporary top bar — full sidebar navigation will be added in Phase 4 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="font-semibold">Money Manager</span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">Transactions</Button>
            </Link>
            <Link href="/budget">
              <Button variant="ghost" size="sm">Budget</Button>
            </Link>
            <Link href="/recurring">
              <Button variant="ghost" size="sm">Recurring</Button>
            </Link>
            <Link href="/goals">
              <Button variant="ghost" size="sm">Goals</Button>
            </Link>
            <Link href="/accounts">
              <Button variant="ghost" size="sm">Accounts</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user.email}
            </span>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
