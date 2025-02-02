'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnswersGridProps {
  answers: string[];
  onAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  correctAnswer: string;
  isAnimating: boolean;
}

export function AnswersGrid({
  answers,
  onAnswer,
  selectedAnswer,
  correctAnswer,
  isAnimating,
}: AnswersGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {answers.map((answer, index) => {
        const isSelected = selectedAnswer === answer;
        const isCorrect = answer === correctAnswer;

        return (
          <motion.div
            key={answer}
            animate={{
              opacity: isAnimating && !isCorrect && !isSelected ? 0.3 : 1,
              scale: isSelected && isCorrect ? 1.05 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => onAnswer(answer)}
              disabled={isAnimating}
              variant="outline"
              className={cn('w-full h-12 text-lg', {
                'bg-green-500/10 border-green-500 text-green-600':
                  isAnimating && isCorrect,
                'bg-red-500/10 border-red-500 text-red-600':
                  isAnimating && !isCorrect && isSelected,
              })}
            >
              {answer}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
