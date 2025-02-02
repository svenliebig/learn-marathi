'use client';

import { Button } from '@/components/ui/button';

interface AnswersGridProps {
  answers: string[];
  onAnswer: (answer: string) => void;
}

export function AnswersGrid({ answers, onAnswer }: AnswersGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {answers.map((answer, index) => (
        <Button
          key={index}
          variant="outline"
          className="p-4 text-lg"
          onClick={() => onAnswer(answer)}
        >
          {answer}
        </Button>
      ))}
    </div>
  );
} 