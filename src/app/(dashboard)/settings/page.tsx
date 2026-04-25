import { getCategories, getRules } from '@/lib/db/queries';
import { CategoryFormDialog, CategoryListItem } from '@/components/categories/category-form-dialog';
import { RuleList } from '@/components/rules/rule-list';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function SettingsPage() {
  const [categories, rules] = await Promise.all([
    getCategories(),
    getRules()
  ]);

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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your categories, rules, and preferences.
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Categorization Rules</h2>
            <p className="text-sm text-muted-foreground">
              Rules automatically categorize your transactions during imports or manual entry.
            </p>
          </div>
          <Separator />
          
          <RuleList rules={rules} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
