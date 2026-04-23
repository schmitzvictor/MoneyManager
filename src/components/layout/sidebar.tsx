'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Repeat,
  Target,
  Landmark,
  Settings,
  Wallet,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budget', label: 'Budget', icon: PieChart },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-[220px] lg:w-[240px] flex-col border-r bg-muted/30">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">Money Manager</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                />
              }>
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3">
        <p className="text-xs text-muted-foreground text-center">
          Money Manager v0.1
        </p>
      </div>
    </aside>
  );
}

export { navItems };
