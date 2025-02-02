'use client';

import { Card } from '@/components/ui/card';

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
      className={`p-12 mb-8 text-center transform-gpu hover:scale-105 transition-transform ${className}`}
    >
      <h2 className="text-6xl mb-4 font-bold">{letter}</h2>
      <p className="text-sm text-muted-foreground">{instruction}</p>
    </Card>
  );
}
