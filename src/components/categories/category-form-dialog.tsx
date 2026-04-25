'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryFormValues } from '@/lib/validations';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/categories';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface CategoryFormDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentCategories: any[];
  trigger?: React.ReactNode;
}

export function CategoryFormDialog({ category, parentCategories, trigger }: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      kind: category?.kind ?? 'expense',
      parent_id: category?.parent_id ?? null,
      icon: category?.icon ?? '',
      sort_order: category?.sort_order ?? 0,
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    setServerError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = isEdit
      ? await updateCategory(category.id, values)
      : await createCategory(values);

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
            <Button variant="ghost" size="icon" className="h-7 w-7" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {trigger || (isEdit ? (
          <Pencil className="h-3 w-3" />
        ) : (
          <>
            <Plus className="mr-1 h-4 w-4" />
            New Category
          </>
        ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update category details.' : 'Add a new category or subcategory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" placeholder="🛒" {...form.register('icon')} className="text-center" />
            </div>
            <div className="col-span-3 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Supermercado" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Kind</Label>
              <Select
                value={form.watch('kind')}
                onValueChange={(v: string | null) => { if (v) form.setValue('kind', v as CategoryFormValues['kind']) }}
              >
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent</Label>
              <Select
                value={form.watch('parent_id') ?? 'none'}
                onValueChange={(v: string | null) => form.setValue('parent_id', v === 'none' ? null : v)}
              >
                <SelectTrigger id="parent_id">
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {parentCategories
                    .filter((c) => !c.parent_id && c.id !== category?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
              {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Category list item with edit/delete
interface CategoryListItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allCategories: any[];
}

export function CategoryListItem({ category, children, allCategories }: CategoryListItemProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${category.name}"? This may affect transactions using this category.`)) return;
    setDeleting(true);
    await deleteCategory(category.id);
    setDeleting(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 group">
        <div className="flex items-center gap-2">
          <span className="text-sm">{category.icon || '📁'}</span>
          <span className="text-sm font-medium">{category.name}</span>
          <span className="text-xs text-muted-foreground">{category.kind}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <CategoryFormDialog category={category} parentCategories={allCategories} />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {children && children.length > 0 && (
        <div className="ml-6 border-l pl-2">
          {children.map((child) => (
            <CategoryListItem
              key={child.id}
              category={child}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
