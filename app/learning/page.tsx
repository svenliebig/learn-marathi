"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Smile, Frown } from 'lucide-react';
import { marathiAlphabet } from '@/lib/marathi-data';
import { ExerciseState, UserProgress } from '@/lib/types';
import { db } from '@/lib/database';

export default function Learning() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseState>({
    mode: (searchParams.get('mode') as 'marathi-to-latin' | 'latin-to-marathi') || 'marathi-to-latin',
    size: 8,
    currentIndex: 0,
    letters: [],
    answers: [],
    correctAnswer: '',
    score: 0,
    mistakes: 0,
    history: [],
  });
  const [showStats, setShowStats] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const initializeExercise = async () => {
      // In production, get actual user ID from session
      const progress = await db.getUserProgress('demo-user');
      const availableLetters = selectLettersBasedOnProgress(progress);
      const selectedLetters = availableLetters
        .sort(() => Math.random() - 0.5)
        .slice(0, exercise.size);

      setExercise(prev => ({
        ...prev,
        letters: selectedLetters,
        currentIndex: 0,
        score: 0,
        mistakes: 0,
        history: [],
      }));
    };

    initializeExercise();
  }, [exercise.mode, exercise.size]);

  const selectLettersBasedOnProgress = (progress: UserProgress) => {
    const exerciseProgress = progress.exercises[exercise.mode];
    if (!exerciseProgress || exerciseProgress.completedLetters.length < 4) {
      // For beginners, start with the first 8 letters
      return marathiAlphabet.slice(0, 8);
    }
    
    // Mix mastered and new letters
    const masteredLetters = marathiAlphabet.filter(l => 
      exerciseProgress.completedLetters.includes(exercise.mode === 'marathi-to-latin' ? l.marathi : l.latin)
    );
    const newLetters = marathiAlphabet.filter(l => 
      !exerciseProgress.completedLetters.includes(exercise.mode === 'marathi-to-latin' ? l.marathi : l.latin)
    );
    
    return [...masteredLetters, ...newLetters];
  };

  const generateAnswers = (correct: string) => {
    const answers = [correct];
    while (answers.length < 4) {
      const randomLetter = marathiAlphabet[Math.floor(Math.random() * marathiAlphabet.length)];
      const randomAnswer = exercise.mode === 'marathi-to-latin' ? randomLetter.latin : randomLetter.marathi;
      if (!answers.includes(randomAnswer)) {
        answers.push(randomAnswer);
      }
    }
    return answers.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = async (answer: string) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const currentLetter = exercise.letters[exercise.currentIndex];
    const correctAnswer = exercise.mode === 'marathi-to-latin' ? currentLetter.latin : currentLetter.marathi;
    const isCorrect = answer === correctAnswer;

    // Update progress
    const progress = await db.getUserProgress('demo-user');
    const letterKey = exercise.mode === 'marathi-to-latin' ? currentLetter.marathi : currentLetter.latin;
    
    if (!progress.exercises[exercise.mode]) {
      progress.exercises[exercise.mode] = {
        completedLetters: [],
        letterStats: {},
      };
    }

    if (!progress.exercises[exercise.mode].letterStats[letterKey]) {
      progress.exercises[exercise.mode].letterStats[letterKey] = {
        attempts: 0,
        correct: 0,
        lastTenAttempts: [],
      };
    }

    const stats = progress.exercises[exercise.mode].letterStats[letterKey];
    stats.attempts++;
    if (isCorrect) stats.correct++;
    stats.lastTenAttempts = [...stats.lastTenAttempts.slice(-9), isCorrect];

    // Check if letter is mastered (last 10 attempts all correct)
    if (stats.lastTenAttempts.length >= 10 && 
        stats.lastTenAttempts.every(attempt => attempt) &&
        !progress.exercises[exercise.mode].completedLetters.includes(letterKey)) {
      progress.exercises[exercise.mode].completedLetters.push(letterKey);
    }

    await db.updateUserProgress('demo-user', progress);

    setExercise(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      mistakes: isCorrect ? prev.mistakes : prev.mistakes + 1,
      history: [...prev.history, { letter: letterKey, correct: isCorrect }],
    }));

    // Wait for animation
    setTimeout(() => {
      setIsAnimating(false);
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

  if (showStats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold mb-4">Exercise Complete!</h2>
          <div className="space-y-4 mb-8">
            <p>Correct Answers: {exercise.score}</p>
            <p>Mistakes: {exercise.mistakes}</p>
            <p>Accuracy: {((exercise.score / exercise.size) * 100).toFixed(1)}%</p>
          </div>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => {
                setExercise(prev => ({
                  ...prev,
                  currentIndex: 0,
                  score: 0,
                  mistakes: 0,
                  history: [],
                }));
                setShowStats(false);
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentLetter = exercise.letters[exercise.currentIndex];
  if (!currentLetter) return null;

  const displayText = exercise.mode === 'marathi-to-latin' ? currentLetter.marathi : currentLetter.latin;
  const answers = generateAnswers(exercise.mode === 'marathi-to-latin' ? currentLetter.latin : currentLetter.marathi);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {exercise.mode === 'marathi-to-latin' ? 'Identify the Marathi Letter' : 'Write in Marathi'}
          </h1>
          <Progress 
            value={(exercise.currentIndex / exercise.size) * 100} 
            className="h-2"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={exercise.currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="perspective-1000"
          >
            <Card 
              className="p-12 mb-8 text-center transform-gpu transition-transform hover:scale-105 cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <motion.div className="text-6xl mb-4 font-bold">
                {isAnimating ? (
                  exercise.history[exercise.history.length - 1]?.correct ? (
                    <Smile className="w-16 h-16 mx-auto text-green-500" />
                  ) : (
                    <Frown className="w-16 h-16 mx-auto text-red-500" />
                  )
                ) : (
                  displayText
                )}
              </motion.div>
              <p className="text-sm text-muted-foreground">
                Choose the correct {exercise.mode === 'marathi-to-latin' ? 'Latin' : 'Marathi'} representation
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
              disabled={isAnimating}
            >
              {answer}
            </Button>
          ))}
        </div>

        <div className="mt-8 flex justify-between text-sm text-muted-foreground">
          <span>Question {exercise.currentIndex + 1} of {exercise.size}</span>
          <span>Score: {exercise.score}</span>
        </div>
      </div>
    </div>
  );
}