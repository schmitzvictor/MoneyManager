'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations';
import { createTransaction } from '@/lib/actions/transactions';
import { useQuickAddStore } from '@/store/quick-add-store';
import { parseQuickAddText } from '@/lib/quick-add/parser';
import { buildSuggestion } from '@/lib/quick-add/suggestions';
import { normalizeMerchantName } from '@/lib/utils/hashes';
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
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickAddSheetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  merchants?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentTransactions?: any[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickAddSheet({
  accounts,
  categories,
  rules = [],
  merchants = [],
  recentTransactions = [],
}: QuickAddSheetProps) {
  const { isOpen, close, prefill, clearPrefill, lastAccountId, setLastAccountId } =
    useQuickAddStore();

  const [serverError, setServerError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [smartText, setSmartText] = useState('');
  const [suggestionBadge, setSuggestionBadge] = useState<string | null>(null);

  const smartInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];

  const defaultAccountId =
    prefill.accountId ?? lastAccountId ?? accounts[0]?.id ?? '';

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: defaultAccountId,
      type: 'expense',
      status: 'posted',
      amount: prefill.amount ?? ('' as unknown as number),
      description: prefill.description ?? '',
      date: today,
      category_id: prefill.categoryId ?? null,
    },
  });

  const watchType = form.watch('type');

  // Filter categories by current transaction type
  const filteredCategories = categories.filter(
    (c) => c.kind === watchType || (watchType === 'transfer' && c.kind === 'transfer')
  );

  // ── Recent category IDs for suggestion engine ───────────────────────────────
  const recentCategoryIds: string[] = recentTransactions
    .map((tx) => tx.category_id)
    .filter(Boolean)
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .slice(0, 10);

  // ── Apply prefill when store changes ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      account_id: prefill.accountId ?? lastAccountId ?? accounts[0]?.id ?? '',
      type: 'expense',
      status: 'posted',
      amount: prefill.amount ?? ('' as unknown as number),
      description: prefill.description ?? '',
      date: today,
      category_id: prefill.categoryId ?? null,
    });
    setSmartText(prefill.description ?? '');
    setSuggestionBadge(null);
    setServerError(null);
    setShowMore(false);
    // Autofocus smart text or amount
    setTimeout(() => smartInputRef.current?.focus(), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Smart text parsing ───────────────────────────────────────────────────────
  const handleSmartTextChange = useCallback(
    (value: string) => {
      setSmartText(value);
      if (!value.trim()) {
        setSuggestionBadge(null);
        return;
      }

      const parsed = parseQuickAddText(value);

      if (parsed.amount !== null) {
        form.setValue('amount', parsed.amount);
      }
      if (parsed.merchant) {
        form.setValue('description', parsed.merchant);
      }

      // Run suggestion engine
      const suggestion = buildSuggestion({
        description: parsed.merchant || value,
        amount: parsed.amount,
        rules,
        merchants,
        recentCategoryIds,
        categories: categories.map((c) => ({ id: c.id, kind: c.kind })),
        type: form.getValues('type') as 'income' | 'expense' | 'transfer',
      });

      if (suggestion.categoryId) {
        form.setValue('category_id', suggestion.categoryId);
        const cat = categories.find((c) => c.id === suggestion.categoryId);
        const badge =
          suggestion.source === 'rule'
            ? `Rule: ${cat?.name ?? ''}`
            : suggestion.source === 'merchant'
              ? `Merchant: ${cat?.name ?? ''}`
              : `Recent: ${cat?.name ?? ''}`;
        setSuggestionBadge(badge);
      } else {
        setSuggestionBadge(null);
      }

      if (suggestion.accountId) {
        form.setValue('account_id', suggestion.accountId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rules, merchants, recentCategoryIds, categories]
  );

  // ── Merchant chip click ──────────────────────────────────────────────────────
  const handleMerchantChip = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (merchant: any) => {
      const text = merchant.display_name;
      setSmartText(text);
      form.setValue('description', text);
      if (merchant.last_amount) form.setValue('amount', merchant.last_amount);
      if (merchant.default_category_id)
        form.setValue('category_id', merchant.default_category_id);
      if (merchant.default_account_id)
        form.setValue('account_id', merchant.default_account_id);
      const cat = categories.find((c) => c.id === merchant.default_category_id);
      setSuggestionBadge(cat ? `Merchant: ${cat.name}` : null);
    },
    [categories, form]
  );

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function onSubmit(values: TransactionFormValues) {
    setServerError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await createTransaction(values);
    if (result?.error) {
      const errMsg =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error).flat().join(', ');
      setServerError(errMsg);
      return;
    }

    // Remember last used account
    if (values.account_id) setLastAccountId(values.account_id);

    clearPrefill();
    close();
    setSmartText('');
    setSuggestionBadge(null);
    form.reset({
      account_id: values.account_id,
      type: 'expense',
      status: 'posted',
      amount: '' as unknown as number,
      description: '',
      date: today,
      category_id: null,
    });
  }

  // ── Keyboard shortcut to close ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // ── Render ───────────────────────────────────────────────────────────────────
  const topMerchants = merchants.slice(0, 6);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Quick Add
          </SheetTitle>
          <SheetDescription>
            Type naturally — e.g. &ldquo;starbucks 18&rdquo; or &ldquo;gastei 45 no ifood&rdquo;
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col px-6 pb-6 gap-4"
        >
          {/* ── Smart text input ──────────────────────────────────────────── */}
          <div className="space-y-1">
            <Input
              ref={smartInputRef}
              id="qa-smart-text"
              placeholder="starbucks 18 or R$ 45 ifood…"
              value={smartText}
              onChange={(e) => handleSmartTextChange(e.target.value)}
              className="text-base h-11"
              autoComplete="off"
            />
            {suggestionBadge && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />
                {suggestionBadge}
              </p>
            )}
          </div>

          {/* ── Recent merchant chips ─────────────────────────────────────── */}
          {topMerchants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topMerchants.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMerchantChip(m)}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {m.display_name}
                </button>
              ))}
            </div>
          )}

          {/* ── Type toggle ───────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Type</Label>
            <div className="flex rounded-lg border overflow-hidden">
              {(['expense', 'income', 'transfer'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    form.setValue('type', t);
                    form.setValue('category_id', null);
                    setSuggestionBadge(null);
                  }}
                  className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                    watchType === t
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ── Amount ───────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="qa-amount" className="text-xs text-muted-foreground uppercase tracking-wide">
              Amount
            </Label>
            <Input
              id="qa-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register('amount', { valueAsNumber: true })}
              className="text-lg font-semibold h-11"
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* ── Description ─────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="qa-description" className="text-xs text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <Input
              id="qa-description"
              placeholder="e.g. Coffee"
              {...form.register('description')}
            />
          </div>

          {/* ── Account ──────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Account</Label>
            <Select
              value={form.watch('account_id')}
              onValueChange={(v: string | null) => {
                if (v) form.setValue('account_id', v);
              }}
            >
              <SelectTrigger>
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
              <p className="text-xs text-destructive">
                {form.formState.errors.account_id.message}
              </p>
            )}
          </div>

          {/* ── Category ─────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
            <Select
              value={form.watch('category_id') || ''}
              onValueChange={(v: string | null) => {
                form.setValue('category_id', v || null);
                setSuggestionBadge(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── More options (collapsible) ────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            {showMore ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {showMore ? 'Hide options' : 'More options'}
          </button>

          {showMore && (
            <div className="space-y-4 border-t pt-4">
              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="qa-date" className="text-xs text-muted-foreground uppercase tracking-wide">
                  Date
                </Label>
                <Input id="qa-date" type="date" {...form.register('date')} />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="qa-notes" className="text-xs text-muted-foreground uppercase tracking-wide">
                  Notes
                </Label>
                <Input id="qa-notes" placeholder="Optional note…" {...form.register('notes')} />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(v) =>
                    form.setValue(
                      'status',
                      v as 'posted' | 'pending' | 'planned'
                    )
                  }
                >
                  <SelectTrigger>
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
          )}

          {/* ── Server error ─────────────────────────────────────────────────── */}
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {/* ── Actions ──────────────────────────────────────────────────────── */}
          <div className="flex gap-2 mt-auto pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={close}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Saving…' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
