'use client';

import { deleteTransaction, duplicateTransaction } from '@/lib/actions/transactions';
import { TransactionFormDialog } from '@/components/transactions/transaction-form-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Copy, Trash2 } from 'lucide-react';

interface TransactionActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}

export function TransactionActions({ transaction, accounts, categories }: TransactionActionsProps) {
  async function handleDuplicate() {
    await duplicateTransaction(transaction.id);
  }

  async function handleDelete() {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(transaction.id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <TransactionFormDialog
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem onSelect={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
