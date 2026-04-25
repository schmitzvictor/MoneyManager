'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations';
import { createTransaction, updateTransaction } from '@/lib/actions/transactions';
import { applyRules } from '@/lib/rules/engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { createRule } from '@/lib/actions/rules';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil } from 'lucide-react';

interface TransactionFormDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any[];
  trigger?: React.ReactNode;
}

export function TransactionFormDialog({
  transaction,
  accounts,
  categories,
  rules = [],
  trigger,
}: TransactionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!transaction;

  const today = new Date().toISOString().split('T')[0];

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: transaction?.account_id ?? (accounts[0]?.id || ''),
      category_id: transaction?.category_id ?? null,
      type: transaction?.type ?? 'expense',
      status: transaction?.status ?? 'posted',
      amount: transaction?.amount ?? 0,
      description: transaction?.description ?? '',
      merchant_name: transaction?.merchant_name ?? '',
      notes: transaction?.notes ?? '',
      date: transaction?.date ?? today,
      transfer_account_id: transaction?.transfer_account_id ?? null,
    },
  });


  const watchType = form.watch('type');
  const watchDesc = form.watch('description');

  // Filter categories based on transaction type
  const filteredCategories = categories.filter((c) => {
    if (watchType === 'transfer') return c.kind === 'transfer';
    return c.kind === watchType;
  });

  // Auto-categorize based on rules
  useEffect(() => {
    if (!isEdit && watchDesc && rules.length > 0) {
      // Only auto-categorize if the user hasn't manually selected one
      const currentCat = form.getValues('category_id');
      if (!currentCat) {
        const matchedCat = applyRules({ description: watchDesc }, rules);
        if (matchedCat) {
          form.setValue('category_id', matchedCat, { shouldValidate: true, shouldDirty: true });
        }
      }
    }
  }, [watchDesc, isEdit, rules, form]);

  const watchCat = form.watch('category_id');

  // Track if a rule was recently created to show success state
  const [ruleCreated, setRuleCreated] = useState(false);

  async function handleCreateRule() {
    if (!watchDesc || !watchCat) return;
    const res = await createRule({
      name: `Auto: ${watchDesc.substring(0, 20)}`,
      field: 'description',
      operator: 'contains',
      value: watchDesc,
      category_id: watchCat,
      priority: 0, // will be auto-assigned next priority
      is_active: true,
    });
    if (res.success) {
      setRuleCreated(true);
      setTimeout(() => setRuleCreated(false), 3000);
    }
  }

  async function onSubmit(values: TransactionFormValues) {
    setServerError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = isEdit
      ? await updateTransaction(transaction.id, values)
      : await createTransaction(values);

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
            New Transaction
          </>
        ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of this transaction.'
              : 'Record a new income, expense, or transfer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={watchType === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => form.setValue('type', t)}
                className={
                  watchType === t
                    ? t === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : t === 'expense'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    : ''
                }
              >
                {t === 'income' ? 'Income' : t === 'expense' ? 'Expense' : 'Transfer'}
              </Button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="text-lg"
              {...form.register('amount', { valueAsNumber: true })}
              autoFocus
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Almoço"
              {...form.register('description')}
            />
          </div>

          {/* Merchant */}
          <div className="space-y-2">
            <Label htmlFor="merchant_name">Merchant</Label>
            <Input
              id="merchant_name"
              placeholder="e.g. iFood, Uber"
              {...form.register('merchant_name')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Account */}
            <div className="space-y-2">
              <Label htmlFor="account_id">Account</Label>
              <Select
                value={form.watch('account_id')}
                onValueChange={(v: string | null) => { if (v) form.setValue('account_id', v) }}
              >
                <SelectTrigger id="account_id">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.account_id && (
                <p className="text-xs text-destructive">{form.formState.errors.account_id.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={form.watch('category_id') ?? ''}
                onValueChange={(v) => form.setValue('category_id', v || null)}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {watchDesc && watchCat && (
                <div className="pt-1">
                  {ruleCreated ? (
                    <span className="text-xs text-emerald-600 font-medium">Rule created!</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateRule}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Create rule for "{watchDesc.substring(0,15)}{watchDesc.length > 15 ? '...' : ''}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Transfer destination */}
          {watchType === 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="transfer_account_id">Transfer To</Label>
              <Select
                value={form.watch('transfer_account_id') ?? ''}
                onValueChange={(v) => form.setValue('transfer_account_id', v || null)}
              >
                <SelectTrigger id="transfer_account_id">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.id !== form.watch('account_id'))
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...form.register('date')} />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v: string | null) => { if (v) form.setValue('status', v as TransactionFormValues['status']) }}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
              rows={2}
              {...form.register('notes')}
            />
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
