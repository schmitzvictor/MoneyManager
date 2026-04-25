'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recurringSchema, type RecurringFormValues } from '@/lib/validations';
import { createRecurring, updateRecurring } from '@/lib/actions/recurring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface RecurringFormDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  series?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  trigger?: React.ReactNode;
}

export function RecurringFormDialog({ series, accounts, categories, trigger }: RecurringFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!series;

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      account_id: series?.account_id ?? '',
      category_id: series?.category_id ?? '',
      type: series?.type ?? 'expense',
      amount: series?.amount ?? 0,
      description: series?.description ?? '',
      frequency: series?.frequency ?? 'monthly',
      start_date: series?.start_date ?? '',
      end_date: series?.end_date ?? '',
      auto_create: series?.auto_create ?? false,
    },
  });

  async function onSubmit(values: RecurringFormValues) {
    setServerError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = isEdit
      ? await updateRecurring(series.id, values)
      : await createRecurring(values);

    if (result?.error) {
      const errMsg = typeof result.error === 'string'
        ? result.error
        : Object.values(result.error).flat().join(', ');
      setServerError(errMsg);
      return;
    }

    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            <span />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {trigger || (
          <>
            <Plus className="mr-1 h-4 w-4" />
            New Recurring
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Recurring' : 'New Recurring Transaction'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update this recurring series.' : 'Set up a transaction that repeats on a schedule.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(v: string | null) => { if (v) form.setValue('type', v as RecurringFormValues['type']); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={form.watch('frequency')}
                onValueChange={(v: string | null) => { if (v) form.setValue('frequency', v as RecurringFormValues['frequency']); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="e.g. Netflix subscription" {...form.register('description')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...form.register('amount', { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...form.register('start_date')} />
              {form.formState.errors.start_date && (
                <p className="text-xs text-destructive">{form.formState.errors.start_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input id="end_date" type="date" {...form.register('end_date')} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="auto_create"
              checked={form.watch('auto_create')}
              onCheckedChange={(v) => form.setValue('auto_create', v)}
            />
            <Label htmlFor="auto_create">Auto-create transactions</Label>
          </div>

          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
