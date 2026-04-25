import { getCategories } from '@/lib/db/queries';
import { CategoryFormDialog, CategoryListItem } from '@/components/categories/category-form-dialog';
import { Separator } from '@/components/ui/separator';

export default async function SettingsPage() {
  const categories = await getCategories();

  // Group into parent and children
  const parentCategories = categories.filter((c) => !c.parent_id);
  const childMap = new Map<string, typeof categories>();
  categories.forEach((c) => {
    if (c.parent_id) {
      const children = childMap.get(c.parent_id) || [];
      children.push(c);
      childMap.set(c.parent_id, children);
    }
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your categories, rules, and preferences.
        </p>
      </div>

      {/* Category Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Categories</h2>
            <p className="text-sm text-muted-foreground">
              Organize your transactions with categories and subcategories.
            </p>
          </div>
          <CategoryFormDialog parentCategories={categories} />
        </div>
        <Separator />

        {parentCategories.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No categories yet. Create your first one above.
          </div>
        ) : (
          <div className="space-y-1">
            {parentCategories.map((parent) => (
              <CategoryListItem
                key={parent.id}
                category={parent}
                children={childMap.get(parent.id)}
                allCategories={categories}
              />
            ))}
          </div>
        )}
      </section>

      {/* Rules Management — will be added in Phase 8 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Rules</h2>
          <p className="text-sm text-muted-foreground">
            Automatic transaction categorization rules. Coming in Phase 8.
          </p>
        </div>
        <Separator />
        <div className="text-center py-8 text-sm text-muted-foreground">
          Rules engine will be implemented in Phase 8.
        </div>
      </section>
    </div>
  );
}
