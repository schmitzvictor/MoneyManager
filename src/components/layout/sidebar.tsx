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

const navItems = [
  { href: '/dashboard',    label: 'Início',      icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações',  icon: ArrowLeftRight  },
  { href: '/budget',       label: 'Orçamento',   icon: PieChart        },
  { href: '/recurring',    label: 'Recorrentes', icon: Repeat          },
  { href: '/goals',        label: 'Metas',       icon: Target          },
  { href: '/accounts',     label: 'Contas',      icon: Landmark        },
  { href: '/settings',     label: 'Config.',     icon: Settings        },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="relative z-10 hidden md:flex flex-col"
      style={{
        width: 210,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 px-5"
        style={{
          height: 62,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            width: 34, height: 34, borderRadius: 11,
            background: 'linear-gradient(135deg, oklch(0.75 0.18 140), oklch(0.65 0.18 200))',
            boxShadow: '0 4px 16px oklch(0.75 0.18 140 / 0.25)',
          }}
        >
          <Wallet className="h-4 w-4 text-white" />
        </div>
        <span
          className="whitespace-nowrap"
          style={{
            fontWeight: 800, fontSize: 15,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: -0.5,
          }}
        >
          Money Manager
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
                isActive
                  ? 'font-semibold'
                  : 'font-normal hover:bg-white/5'
              )}
              style={isActive ? {
                background: 'oklch(0.75 0.18 140 / 0.15)',
                color: 'oklch(0.75 0.18 140)',
              } : {
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {/* Active bar indicator */}
              {isActive && (
                <span
                  className="absolute left-0 rounded-r"
                  style={{
                    top: '20%', height: '60%', width: 3,
                    background: 'oklch(0.75 0.18 140)',
                  }}
                />
              )}
              <item.icon
                className="h-4 w-4 shrink-0"
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className="flex items-center gap-2.5 px-3 py-3.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex shrink-0 items-center justify-center text-sm font-black"
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, oklch(0.75 0.18 140 / 0.3), oklch(0.65 0.18 300 / 0.3))',
            color: 'oklch(0.75 0.18 140)',
          }}
        >
          V
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>Victor</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>v0.1-dev</div>
        </div>
      </div>
    </aside>
  );
}

export { navItems };
