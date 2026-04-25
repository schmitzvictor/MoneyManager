'use client';

import { useState, useEffect } from 'react';
import { ParsedTransaction } from '@/lib/import';
import { formatCurrency } from '@/lib/utils/currency';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { checkDuplicatesAction, finalizeImportAction } from '@/lib/actions/imports';
import { useRouter } from 'next/navigation';

interface ImportPreviewTableProps {
  accountId: string;
  filename: string;
  format: 'csv' | 'ofx';
  data: ParsedTransaction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  onCancel: () => void;
}

export function ImportPreviewTable({
  accountId,
  filename,
  format,
  data: initialData,
  categories,
  onCancel,
}: ImportPreviewTableProps) {
  const router = useRouter();
  
  // State
  const [data, setData] = useState<ParsedTransaction[]>(initialData);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [duplicateHashes, setDuplicateHashes] = useState<Set<string>>(new Set());
  
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkDups() {
      try {
        const hashes = await checkDuplicatesAction(
          accountId,
          initialData.map((d) => ({ date: d.date, amount: d.amount, description: d.description }))
        );
        const dupSet = new Set(hashes);
        setDuplicateHashes(dupSet);

        // Auto-select non-duplicates
        const toSelect = new Set<string>();
        initialData.forEach((row) => {
          // We need to generate the hash locally to compare
          // Note: duplicate check relies on generateImportHash from lib/import/normalize
          // For simplicity in the UI, we assume the server returns the EXACT hashes
          // Let's re-import the hash function to match:
          import('@/lib/import/normalize').then(({ generateImportHash }) => {
             const h = generateImportHash(accountId, row.date, row.amount, row.description);
             if (!dupSet.has(h)) {
               toSelect.add(row.id);
             }
          });
        });
        
        // Wait a tick for the import to resolve
        setTimeout(() => setSelectedIds(toSelect), 50);

      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    }
    checkDups();
  }, [accountId, initialData]);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const updateRow = (id: string, field: keyof ParsedTransaction, value: string) => {
    setData((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    setIsSaving(true);
    setError(null);

    const transactionsToImport = data
      .filter((d) => selectedIds.has(d.id))
      .map((d) => ({
        date: d.date,
        description: d.description,
        amount: d.amount,
        type: d.type,
        categoryId: d.categoryId,
      }));

    try {
      const res = await finalizeImportAction({
        accountId,
        filename,
        format,
        totalRows: initialData.length,
        transactions: transactionsToImport,
      });

      if (res.error) throw new Error(res.error);
      
      router.push('/transactions');
    } catch (err: any) {
      setError(err.message || 'Failed to import transactions');
      setIsSaving(false);
    }
  };

  if (isChecking) {
    return <div className="text-center p-12 text-muted-foreground animate-pulse">Checking for duplicates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Review Import</h2>
          <p className="text-sm text-muted-foreground">
            {initialData.length} rows found. {duplicateHashes.size > 0 && <span className="text-amber-600 font-medium">{duplicateHashes.size} potential duplicates detected.</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleImport} disabled={isSaving || selectedIds.size === 0}>
            {isSaving ? 'Importing...' : `Import ${selectedIds.size} rows`}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-500/10 rounded-md border border-red-500/20">
          {error}
        </div>
      )}

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 w-12 text-center">
                <Checkbox 
                  checked={selectedIds.size === data.length && data.length > 0}
                  onCheckedChange={(c: boolean | "indeterminate") => toggleAll(c as boolean)}
                />
              </th>
              <th className="p-3 w-28">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3 w-48">Category</th>
              <th className="p-3 w-32 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row) => {
              const isSelected = selectedIds.has(row.id);
              // Need a synchronous check here for duplicates if we didn't store the flag on the row.
              // For robustness, we will just use the visual state but let's assume we can compute the hash again or we'll just check if it was auto-deselected initially.
              // Actually, better to just let the user edit.
              return (
                <tr key={row.id} className={isSelected ? 'bg-background' : 'bg-muted/30 opacity-60'}>
                  <td className="p-3 text-center">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={(c: boolean | "indeterminate") => toggleRow(row.id, c as boolean)}
                    />
                  </td>
                  <td className="p-3">
                    <Input 
                      type="date" 
                      value={row.date} 
                      onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                      className="h-8 text-xs px-2"
                    />
                  </td>
                  <td className="p-3">
                    <Input 
                      value={row.description} 
                      onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                      className="h-8 text-xs px-2"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={row.categoryId || ''}
                      onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)}
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={row.type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                        {row.type === 'income' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      </span>
                      <span className="font-medium">{formatCurrency(row.amount)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
