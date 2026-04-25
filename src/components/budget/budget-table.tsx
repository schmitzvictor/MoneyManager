'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { type BudgetLineItem, type BudgetStatus } from '@/lib/utils/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { upsertBudgetItem, deleteBudgetItem } from '@/lib/actions/budgets';

interface BudgetTableProps {
  month: string;
  lines: BudgetLineItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  budgetItems: any[]; // raw budget_items with id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allCategories: any[];
}

const statusStyles: Record<BudgetStatus, { bar: string; text: string }> = {
  safe: { bar: 'bg-emerald-500', text: 'text-emerald-600' },
  near_limit: { bar: 'bg-amber-500', text: 'text-amber-600' },
  over_limit: { bar: 'bg-red-500', text: 'text-red-600' },
};

export function BudgetTable({ month, lines, budgetItems, allCategories }: BudgetTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Categories not yet budgeted
  const budgetedCategoryIds = new Set(lines.map((l) => l.categoryId));
  const expenseCategories = allCategories.filter(
    (c) => c.kind === 'expense' && !budgetedCategoryIds.has(c.id)
  );

  const handleAdd = async () => {
    if (!newCategoryId || !newAmount) return;
    setSavingId('new');
    await upsertBudgetItem(month, newCategoryId, parseFloat(newAmount));
    setIsAdding(false);
    setNewCategoryId('');
    setNewAmount('');
    setSavingId(null);
  };

  const handleSave = async (categoryId: string) => {
    const val = editValues[categoryId];
    if (val === undefined) return;
    setSavingId(categoryId);
    await upsertBudgetItem(month, categoryId, parseFloat(val));
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    setSavingId(null);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Remove this budget item?')) return;
    await deleteBudgetItem(itemId);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_120px_120px_80px_60px] gap-2 px-4 py-3 bg-muted text-xs font-medium text-muted-foreground border-b">
        <div>Category</div>
        <div className="text-right">Planned</div>
        <div className="text-right">Actual</div>
        <div className="text-right">Remaining</div>
        <div className="text-right">Usage</div>
        <div></div>
      </div>

      {/* Rows */}
      {lines.length === 0 && !isAdding && (
        <div className="px-4 py-12 text-center text-sm text-muted-foreground">
          No budget items for this month. Add categories below to start budgeting.
        </div>
      )}

      {lines.map((line) => {
        const rawItem = budgetItems.find((bi) => bi.category_id === line.categoryId);
        const style = statusStyles[line.status];
        const isEditing = editValues[line.categoryId] !== undefined;
        const displayPlanned = isEditing ? editValues[line.categoryId] : String(line.planned);

        return (
          <div
            key={line.categoryId}
            className="grid grid-cols-[1fr_120px_120px_120px_80px_60px] gap-2 px-4 py-3 items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors"
          >
            {/* Category */}
            <div className="flex items-center gap-2">
              {line.categoryIcon && <span>{line.categoryIcon}</span>}
              <span className="font-medium text-sm">{line.categoryName}</span>
            </div>

            {/* Planned (editable) */}
            <div className="flex items-center gap-1 justify-end">
              <Input
                type="number"
                step="0.01"
                min="0"
                className="h-7 text-xs text-right w-24 px-2"
                value={displayPlanned}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [line.categoryId]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(line.categoryId);
                }}
              />
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={savingId === line.categoryId}
                  onClick={() => handleSave(line.categoryId)}
                >
                  <Save className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Actual */}
            <div className="text-right text-sm font-medium">
              {formatCurrency(line.actual)}
            </div>

            {/* Remaining */}
            <div className={`text-right text-sm font-medium ${style.text}`}>
              {line.remaining >= 0 ? formatCurrency(line.remaining) : `-${formatCurrency(Math.abs(line.remaining))}`}
            </div>

            {/* Usage bar */}
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-semibold ${style.text}`}>
                {Math.round(line.percentage)}%
              </span>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${style.bar}`}
                  style={{ width: `${Math.min(line.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              {rawItem && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(rawItem.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add row */}
      {isAdding ? (
        <div className="grid grid-cols-[1fr_120px_auto] gap-2 px-4 py-3 items-center border-t bg-muted/20">
          <Select value={newCategoryId} onValueChange={(v) => { if (v) setNewCategoryId(v); }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ''}{c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="h-8 text-xs text-right"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <div className="flex gap-1">
            <Button size="sm" className="h-8" onClick={handleAdd} disabled={savingId === 'new'}>
              {savingId === 'new' ? 'Saving...' : 'Add'}
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t">
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add Category
          </Button>
        </div>
      )}
    </div>
  );
}
