'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, type GoalFormValues } from '@/lib/validations';
import { createGoal, updateGoal } from '@/lib/actions/goals';
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
import { Plus } from 'lucide-react';

const COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#6366F1', '#14B8A6',
];

const ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '🎓', '💍', '🏖️', '💰', '🏋️'];

interface GoalFormDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goal?: any;
  trigger?: React.ReactNode;
}

export function GoalFormDialog({ goal, trigger }: GoalFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!goal;

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name ?? '',
      target_amount: goal?.target_amount ?? 0,
      target_date: goal?.target_date ?? '',
      icon: goal?.icon ?? ICONS[0],
      color: goal?.color ?? COLORS[0],
    },
  });

  async function onSubmit(values: GoalFormValues) {
    setServerError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = isEdit
      ? await updateGoal(goal.id, values)
      : await createGoal(values);

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
            New Goal
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Goal' : 'New Goal'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your savings goal.' : 'Set a new savings goal to work towards.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Emergency Fund" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Amount</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              min="0"
              {...form.register('target_amount', { valueAsNumber: true })}
            />
            {form.formState.errors.target_amount && (
              <p className="text-xs text-destructive">{form.formState.errors.target_amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date (optional)</Label>
            <Input id="target_date" type="date" {...form.register('target_date')} />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => form.setValue('icon', icon)}
                  className={`rounded-md p-1.5 text-xl transition-colors hover:bg-muted ${form.watch('icon') === icon ? 'ring-2 ring-primary' : ''}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

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
              {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
