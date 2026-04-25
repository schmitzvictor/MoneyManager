'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';

interface TransactionFiltersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}

export function TransactionFilters({ accounts, categories }: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page'); // Reset to page 1 on filter change
      startTransition(() => {
        router.push(`/transactions?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilter('search', search);
  }

  function clearFilters() {
    setSearch('');
    startTransition(() => {
      router.push('/transactions');
    });
  }

  const hasFilters =
    searchParams.has('search') ||
    searchParams.has('account') ||
    searchParams.has('category') ||
    searchParams.has('type');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </form>

      <Select
        value={searchParams.get('account') ?? 'all'}
        onValueChange={(v: string | null) => updateFilter('account', v ?? 'all')}
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('type') ?? 'all'}
        onValueChange={(v: string | null) => updateFilter('type', v ?? 'all')}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}

      {isPending && (
        <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
      )}
    </div>
  );
}
