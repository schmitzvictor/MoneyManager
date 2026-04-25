'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Settings2, Trash2 } from 'lucide-react';
import { deleteRule, reorderRules } from '@/lib/actions/rules';
import { RuleFormDialog } from './rule-form-dialog';

interface RuleListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}

export function RuleList({ rules, categories }: RuleListProps) {
  const [isReordering, setIsReordering] = useState(false);

  const moveRule = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;

    setIsReordering(true);

    const newRules = [...rules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newRules[index];
    newRules[index] = newRules[targetIndex];
    newRules[targetIndex] = temp;

    // Build update payload
    const updates = newRules.map((rule, idx) => ({
      id: rule.id,
      priority: idx + 1,
    }));

    try {
      await reorderRules(updates);
    } catch (error) {
      console.error('Failed to reorder', error);
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
    }
  };

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center text-muted-foreground">
        <Settings2 className="w-10 h-10 mb-4 opacity-20" />
        <p className="mb-2">No rules configured yet.</p>
        <p className="text-sm">Create rules to automatically categorize transactions based on description.</p>
        <div className="mt-4">
          <RuleFormDialog categories={categories} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Rules are evaluated in order from top to bottom. The first matching rule applies.
        </p>
        <RuleFormDialog categories={categories} />
      </div>

      <div className="space-y-2">
        {rules.map((rule, index) => (
          <div 
            key={rule.id} 
            className={`flex items-center justify-between p-3 border rounded-lg bg-card ${!rule.is_active && 'opacity-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  disabled={index === 0 || isReordering}
                  onClick={() => moveRule(index, 'up')}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  disabled={index === rules.length - 1 || isReordering}
                  onClick={() => moveRule(index, 'down')}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {rule.name}
                  {!rule.is_active && <span className="text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded font-bold">Inactive</span>}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  If <span className="font-semibold">{rule.field}</span> {rule.operator.replace('_', ' ')} <span className="font-semibold">"{rule.value}"</span>
                  {' → '}
                  then assign <span className="font-semibold text-primary">{rule.categories?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RuleFormDialog rule={rule} categories={categories}>
                <Button variant="outline" size="sm">Edit</Button>
              </RuleFormDialog>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
