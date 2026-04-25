'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';

import { RuleFormValues, ruleSchema } from '@/lib/validations';
import { createRule, updateRule } from '@/lib/actions/rules';

interface RuleFormDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  children?: React.ReactNode;
}

export function RuleFormDialog({ rule, categories, children }: RuleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = !!rule;

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: rule?.name || '',
      field: rule?.field || 'description',
      operator: rule?.operator || 'contains',
      value: rule?.value || '',
      category_id: rule?.category_id || '',
      priority: rule?.priority || 0,
      is_active: rule ? rule.is_active : true,
    },
  });

  async function onSubmit(values: RuleFormValues) {
    setServerError(null);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = isEdit
      ? await updateRule(rule.id, values)
      : await createRule(values);

    if (result?.error) {
      setServerError(result.error);
      return;
    }

    setOpen(false);
    form.reset();
  }

  const errs = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {children || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Rule' : 'New Rule'}</DialogTitle>
        </DialogHeader>

        {serverError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input id="name" placeholder="e.g. Uber Transport" {...form.register('name')} />
            {errs.name && <p className="text-xs text-destructive">{errs.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field">Field</Label>
              <Select 
                value={form.watch('field')} 
                onValueChange={(v) => form.setValue('field', v as string)}
              >
                <SelectTrigger id="field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="merchant_name">Merchant Name</SelectItem>
                </SelectContent>
              </Select>
              {errs.field && <p className="text-xs text-destructive">{errs.field.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="operator">Operator</Label>
              <Select 
                value={form.watch('operator')} 
                onValueChange={(v: any) => form.setValue('operator', v)}
              >
                <SelectTrigger id="operator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="starts_with">Starts With</SelectItem>
                </SelectContent>
              </Select>
              {errs.operator && <p className="text-xs text-destructive">{errs.operator.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Target Value</Label>
            <Input id="value" placeholder="e.g. Uber" {...form.register('value')} />
            {errs.value && <p className="text-xs text-destructive">{errs.value.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Assign Category</Label>
            <Select 
              value={form.watch('category_id') || undefined} 
              onValueChange={(v) => form.setValue('category_id', v as string)}
            >
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errs.category_id && <p className="text-xs text-destructive">{errs.category_id.message}</p>}
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Active</Label>
              <p className="text-sm text-muted-foreground">
                Apply this rule automatically.
              </p>
            </div>
            <Switch
              checked={form.watch('is_active')}
              onCheckedChange={(v) => form.setValue('is_active', v)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
