'use client';

import { usePathname } from 'next/navigation';
import { logout } from '@/lib/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { LogOut, User, Plus } from 'lucide-react';
import { useQuickAddStore } from '@/store/quick-add-store';

const PAGE_INFO: Record<string, { title: string; sub: string }> = {
  '/dashboard':    { title: 'Início',          sub: 'Visão geral das suas finanças'     },
  '/transactions': { title: 'Transações',      sub: 'Histórico completo'                },
  '/budget':       { title: 'Orçamento',       sub: 'Plano mensal vs. realizado'        },
  '/recurring':    { title: 'Recorrentes',     sub: 'Assinaturas e pagamentos fixos'    },
  '/goals':        { title: 'Metas',           sub: 'Progresso das suas metas'          },
  '/accounts':     { title: 'Contas',          sub: 'Todas as suas contas'              },
  '/settings':     { title: 'Configurações',   sub: 'Preferências do app'               },
  '/import':       { title: 'Importar',        sub: 'Importe transações de CSV ou OFX'  },
};

interface AppHeaderProps {
  userEmail: string;
}

export function AppHeader({ userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const { toggle } = useQuickAddStore();

  const initials = userEmail.split('@')[0].slice(0, 2).toUpperCase();

  // Match the most-specific path first
  const pageKey = Object.keys(PAGE_INFO)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || pathname.startsWith(k + '/'));

  const { title, sub } = PAGE_INFO[pageKey ?? '/dashboard'];

  return (
    <header
      className="sticky top-0 z-50 flex shrink-0 items-center justify-between px-7"
      style={{
        height: 62,
        background: 'rgba(7,7,15,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-3">
        <MobileNav />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.5 }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{sub}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Add button */}
        <button
          onClick={toggle}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, oklch(0.75 0.18 140), oklch(0.65 0.18 200))',
            boxShadow: '0 4px 16px oklch(0.75 0.18 140 / 0.3)',
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Adicionar
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full" />
            }
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.75 0.18 140 / 0.25), oklch(0.65 0.18 300 / 0.25))',
                  color: 'oklch(0.75 0.18 140)',
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Conta</p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/settings" className="flex items-center gap-2" />}>
              <User className="h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={async () => { await logout(); }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
