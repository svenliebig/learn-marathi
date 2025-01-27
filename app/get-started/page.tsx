'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { marathiAlphabet } from '@/lib/marathi-data';
import { ExerciseState } from '@/lib/types';
import Link from 'next/link';

export default function GetStarted() {
  const [exercise, setExercise] = useState<ExerciseState>({
    mode: 'marathi-to-latin',
    size: 8,
    currentIndex: 0,
    letters: marathiAlphabet.slice(0, 8),
    answers: [],
    correctAnswer: '',
    score: 0,
    mistakes: 0,
    history: [],
  });

  const [showStats, setShowStats] = useState(false);

  const generateAnswers = (correct: string) => {
    const answers = [correct];
    while (answers.length < 4) {
      const randomLetter =
        marathiAlphabet[Math.floor(Math.random() * marathiAlphabet.length)];
      if (!answers.includes(randomLetter.latin)) {
        answers.push(randomLetter.latin);
      }
    }
    return answers.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === exercise.correctAnswer;
    setExercise(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      mistakes: isCorrect ? prev.mistakes : prev.mistakes + 1,
      history: [
        ...prev.history,
        { letter: prev.letters[prev.currentIndex].marathi, correct: isCorrect },
      ],
      currentIndex: prev.currentIndex + 1,
    }));

    if (exercise.currentIndex + 1 >= exercise.size) {
      setShowStats(true);
    }
  };

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

  const currentLetter = exercise.letters[exercise.currentIndex];
  const answers = generateAnswers(currentLetter.latin);

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
          >
            <Card className="p-12 mb-8 text-center transform-gpu hover:scale-105 transition-transform">
              <h2 className="text-6xl mb-4 font-bold">
                {currentLetter.marathi}
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose the correct Latin representation
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          {answers.map((answer, index) => (
            <Button
              key={index}
              variant="outline"
              className="p-4 text-lg"
              onClick={() => handleAnswer(answer)}
            >
              {answer}
            </Button>
          ))}
        </div>

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
