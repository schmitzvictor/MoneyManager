'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations';
import { createTransaction } from '@/lib/actions/transactions';
import { useQuickAddStore } from '@/store/quick-add-store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface QuickAddSheetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}

export function QuickAddSheet({ accounts, categories }: QuickAddSheetProps) {
  const { isOpen, close } = useQuickAddStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: accounts[0]?.id ?? '',
      type: 'expense',
      status: 'posted',
      amount: 0,
      description: '',
      date: today,
    },
  });

  const watchType = form.watch('type');
  const filteredCategories = categories.filter(
    (c) => c.kind === watchType || c.kind === 'transfer'
  );

  async function onSubmit(values: TransactionFormValues) {
    setServerError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await createTransaction(values);
    if (result?.error) {
      const errMsg = typeof result.error === 'string'
        ? result.error
        : Object.values(result.error).flat().join(', ');
      setServerError(errMsg);
      return;
    }
    close();
    form.reset({ account_id: accounts[0]?.id ?? '', type: 'expense', status: 'posted', amount: 0, description: '', date: today });
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Quick Add Transaction</SheetTitle>
          <SheetDescription>Record a transaction quickly.</SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex rounded-lg border overflow-hidden">
              {(['expense', 'income', 'transfer'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    form.setValue('type', t);
                    form.setValue('category_id', undefined);
                  }}
                  className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${watchType === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="qa-amount">Amount</Label>
            <Input
              id="qa-amount"
              type="number"
              step="0.01"
              min="0"
              autoFocus
              {...form.register('amount', { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="qa-description">Description</Label>
            <Input id="qa-description" placeholder="e.g. Coffee" {...form.register('description')} />
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Account</Label>
            <Select
              value={form.watch('account_id')}
              onValueChange={(v: string | null) => { if (v) form.setValue('account_id', v); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.account_id && (
              <p className="text-xs text-destructive">{form.formState.errors.account_id.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <Select
              value={form.watch('category_id') || ''}
              onValueChange={(v: string | null) => { form.setValue('category_id', v || null); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="qa-date">Date</Label>
            <Input id="qa-date" type="date" {...form.register('date')} />
            {form.formState.errors.date && (
              <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
