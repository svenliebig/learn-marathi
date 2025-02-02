'use client';

import { AnswersGrid } from '@/components/ui/answers-grid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LetterCard } from '@/components/ui/letter-card';
import { LetterCardSuccessCover } from '@/components/ui/letter-card-success-cover';
import { AnswerService } from '@/lib/services/answer-service';
import { LetterService } from '@/lib/services/letter-service';
import { ExerciseState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

export default function GetStarted() {
  const [exercise, setExercise] = useState<ExerciseState>({
    mode: 'marathi-to-latin',
    size: 8,
    currentIndex: 0,
    letters: LetterService.getRandomLetters(8, 1),
    answers: [],
    correctAnswer: '',
    score: 0,
    mistakes: 0,
    history: [],
  });

  const [showStats, setShowStats] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const answerService = useRef<AnswerService>(
    new AnswerService('marathi-to-latin', 1)
  );

  const handleAnswer = (answer: string) => {
    if (isAnimating) return;

    const currentLetter = exercise.letters[exercise.currentIndex];
    const isCorrect = answer === currentLetter.latin;
    setIsAnimating(true);
    setSelectedAnswer(answer);

    setExercise(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      mistakes: isCorrect ? prev.mistakes : prev.mistakes + 1,
      history: [
        ...prev.history,
        { letter: prev.letters[prev.currentIndex].marathi, correct: isCorrect },
      ],
    }));

    // Wait for animation
    setTimeout(() => {
      setIsAnimating(false);
      setSelectedAnswer(null);

      if (exercise.currentIndex + 1 >= exercise.size) {
        setShowStats(true);
      } else {
        setExercise(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
        }));
      }
    }, 1000);
  };

  const currentLetter = exercise.letters[exercise.currentIndex];
  const answers = useMemo(
    () => answerService.current.generateAnswers(currentLetter.latin),
    [currentLetter.latin]
  );

  if (showStats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold mb-4">Exercise Complete!</h2>
          <div className="space-y-4 mb-8">
            <p>Correct Answers: {exercise.score}</p>
            <p>Mistakes: {exercise.mistakes}</p>
            <p>
              Accuracy: {((exercise.score / exercise.size) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/login">
              <Button className="w-full">Sign Up to Continue Learning</Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setExercise({
                  ...exercise,
                  currentIndex: 0,
                  score: 0,
                  mistakes: 0,
                  history: [],
                });
                setShowStats(false);
              }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={exercise.currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative"
          >
            {isAnimating && selectedAnswer === currentLetter.latin && (
              <LetterCardSuccessCover />
            )}
            <LetterCard
              letter={currentLetter.marathi}
              instruction="Choose the correct Latin representation"
              className={cn('z-0 transition-all duration-300', {
                'blur-sm':
                  isAnimating && selectedAnswer === currentLetter.latin,
              })}
            />
          </motion.div>
        </AnimatePresence>

        <AnswersGrid
          answers={answers}
          onAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentLetter.latin}
          isAnimating={isAnimating}
        />

        <div className="mt-8 flex justify-between text-sm text-muted-foreground">
          <span>
            Question {exercise.currentIndex + 1} of {exercise.size}
          </span>
          <span>Score: {exercise.score}</span>
        </div>
      </div>
    </div>
  );
}
