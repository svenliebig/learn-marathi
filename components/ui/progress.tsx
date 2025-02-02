'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

export function Progress({
  className,
  value,
}: React.ComponentPropsWithoutRef<'div'> & {
  value?: number;
}) {
  return (
    <div className={cn('w-full rounded-full h-2.5 bg-secondary', className)}>
      <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  );
}
