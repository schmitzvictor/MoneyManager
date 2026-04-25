'use client';

import { useState } from 'react';
import { deleteAccount } from '@/lib/actions/accounts';
import { AccountFormDialog } from '@/components/accounts/account-form-dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import {
  Landmark,
  PiggyBank,
  Banknote,
  CreditCard,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ACCOUNT_ICONS = {
  checking: Landmark,
  savings: PiggyBank,
  cash: Banknote,
  credit_card: CreditCard,
};

const ACCOUNT_LABELS = {
  checking: 'Checking',
  savings: 'Savings',
  cash: 'Cash',
  credit_card: 'Credit Card',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AccountCard({ account }: { account: any }) {
  const [deleting, setDeleting] = useState(false);
  const Icon = ACCOUNT_ICONS[account.type as keyof typeof ACCOUNT_ICONS] || Landmark;

  async function handleDelete() {
    if (!confirm('Delete this account? All associated transactions will also be deleted.')) return;
    setDeleting(true);
    await deleteAccount(account.id);
    setDeleting(false);
  }

  return (
    <div className="group relative rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${account.color || '#8B5CF6'}20`, color: account.color || '#8B5CF6' }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{account.name}</h3>
            <p className="text-xs text-muted-foreground">
              {ACCOUNT_LABELS[account.type as keyof typeof ACCOUNT_LABELS]}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />}>
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <AccountFormDialog
              account={account}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              }
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold">{formatCurrency(account.current_balance)}</p>
        {account.type === 'credit_card' && account.credit_limit && (
          <p className="text-xs text-muted-foreground mt-1">
            Limit: {formatCurrency(account.credit_limit)} · Available: {formatCurrency(account.credit_limit + account.current_balance)}
          </p>
        )}
      </div>
    </div>
  );
}
