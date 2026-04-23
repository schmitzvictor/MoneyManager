'use client';

import { logout } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { LogOut, User } from 'lucide-react';

interface AppHeaderProps {
  userEmail: string;
}

export function AppHeader({ userEmail }: AppHeaderProps) {
  const initials = userEmail
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MobileNav />

      {/* Spacer pushes right items to the end */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/settings" className="flex items-center gap-2" />}>
              <User className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={async () => {
                await logout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
