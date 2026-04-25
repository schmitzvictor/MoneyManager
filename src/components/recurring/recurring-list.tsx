'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, PlayCircle } from 'lucide-react';
import { deleteRecurring, markOccurrencePosted } from '@/lib/actions/recurring';
import { RecurringFormDialog } from './recurring-form-dialog';

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

interface RecurringListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}

export function RecurringList({ items, accounts, categories }: RecurringListProps) {
  const [posting, setPosting] = useState<string | null>(null);

  async function handlePost(id: string) {
    setPosting(id);
    await markOccurrencePosted(id);
    setPosting(null);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{item.description || 'Unnamed'}</span>
                <Badge variant={item.type === 'income' ? 'default' : 'secondary'}>
                  {item.type}
                </Badge>
                <Badge variant="outline">{FREQUENCY_LABELS[item.frequency]}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{item.accounts?.name}</span>
                {item.categories && <span>{item.categories.icon} {item.categories.name}</span>}
                {item.next_occurrence && (
                  <span>Next: {formatDate(item.next_occurrence)}</span>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className={`font-semibold ${item.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(Number(item.amount))}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                disabled={posting === item.id}
                onClick={() => handlePost(item.id)}
              >
                <PlayCircle className="h-4 w-4" />
                Post
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <RecurringFormDialog
                    series={item}
                    accounts={accounts}
                    categories={categories}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => deleteRecurring(item.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
