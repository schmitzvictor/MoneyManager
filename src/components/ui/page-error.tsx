'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PageErrorProps {
  reset: () => void;
}

export function PageError({ reset }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <AlertCircle className="h-10 w-10 text-destructive/70" />
      <div>
        <p className="font-semibold text-lg">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
      </div>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
