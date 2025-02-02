'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LetterCardProps {
  letter: string;
  instruction: string;
  className?: string;
}

export function LetterCard({
  letter,
  instruction,
  className,
}: LetterCardProps) {
  return (
    <Card
      className={cn(
        'p-12 mb-8 text-center transform-gpu hover:scale-105 transition-transform',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <h2 className="text-6xl mb-4 font-bold">{letter}</h2>
      <p className="text-sm text-muted-foreground">{instruction}</p>
    </Card>
  );
}
