'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { deleteGoal } from '@/lib/actions/goals';
import { GoalFormDialog } from './goal-form-dialog';
import { GoalContributeDialog } from './goal-contribute-dialog';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string | null;
  color: string | null;
}

interface GoalCardProps {
  goal: Goal;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function daysRemaining(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function GoalCard({ goal }: GoalCardProps) {
  const [deleting, setDeleting] = useState(false);

  const pct = Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100));
  const color = goal.color || '#8B5CF6';
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  async function handleDelete() {
    setDeleting(true);
    await deleteGoal(goal.id);
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-5">
        <div className="flex items-center gap-2">
          {goal.icon && <span className="text-xl">{goal.icon}</span>}
          <h3 className="font-semibold leading-tight">{goal.name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" />}>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <GoalFormDialog
              goal={goal}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={deleting}
              onSelect={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        {/* Progress ring */}
        <div className="relative flex items-center justify-center">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <span className="absolute text-lg font-bold">{pct}%</span>
        </div>

        <div className="w-full space-y-1 text-center">
          <p className="text-sm text-muted-foreground">
            {formatCurrency(Number(goal.current_amount))} of {formatCurrency(Number(goal.target_amount))}
          </p>
          {goal.target_date && (
            <Badge variant="secondary" className="text-xs">
              {daysRemaining(goal.target_date) > 0
                ? `${daysRemaining(goal.target_date)} days left`
                : 'Overdue'}
            </Badge>
          )}
        </div>

        <GoalContributeDialog
          goalId={goal.id}
          goalName={goal.name}
          trigger={
            <Button size="sm" className="w-full" style={{ backgroundColor: color, color: '#fff' }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Contribute
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
