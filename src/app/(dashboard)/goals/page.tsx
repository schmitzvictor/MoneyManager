import { getGoals } from '@/lib/db/queries';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalFormDialog } from '@/components/goals/goal-form-dialog';
import { Target } from 'lucide-react';

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">Track your savings goals</p>
        </div>
        <GoalFormDialog />
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <Target className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No goals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first savings goal to get started.</p>
          <div className="mt-4">
            <GoalFormDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
