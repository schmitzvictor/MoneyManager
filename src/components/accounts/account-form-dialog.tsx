'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, type AccountFormValues } from '@/lib/validations';
import { createAccount, updateAccount } from '@/lib/actions/accounts';
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
import { Plus, Pencil } from 'lucide-react';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
];

const COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#6366F1', '#14B8A6',
];

interface AccountFormDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account?: any; // existing account for edit mode
  trigger?: React.ReactNode;
}

export function AccountFormDialog({ account, trigger }: AccountFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!account;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name ?? '',
      type: account?.type ?? 'checking',
      initial_balance: account?.initial_balance ?? 0,
      color: account?.color ?? COLORS[0],
      credit_limit: account?.credit_limit ?? undefined,
      closing_day: account?.closing_day ?? undefined,
      due_day: account?.due_day ?? undefined,
    },
  });

  const watchType = form.watch('type');

  async function onSubmit(values: AccountFormValues) {
    setServerError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = isEdit
      ? await updateAccount(account.id, values)
      : await createAccount(values);

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
          ) : isEdit ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {trigger || (isEdit ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="mr-1 h-4 w-4" />
            New Account
          </>
        ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Account' : 'New Account'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of this account.'
              : 'Add a new financial account to track.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Nubank Conta" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(v: string | null) => { if (v) form.setValue('type', v as AccountFormValues['type']) }}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="initial_balance">Initial Balance</Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                {...form.register('initial_balance', { valueAsNumber: true })}
              />
            </div>
          )}

          {watchType === 'credit_card' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  {...form.register('credit_limit', { valueAsNumber: true })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closing_day">Closing Day</Label>
                  <Input
                    id="closing_day"
                    type="number"
                    min={1}
                    max={31}
                    {...form.register('closing_day', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_day">Due Day</Label>
                  <Input
                    id="due_day"
                    type="number"
                    min={1}
                    max={31}
                    {...form.register('due_day', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => form.setValue('color', c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: form.watch('color') === c ? 'white' : 'transparent',
                    boxShadow: form.watch('color') === c ? `0 0 0 2px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
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
