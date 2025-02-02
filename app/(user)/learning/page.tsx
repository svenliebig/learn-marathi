'use client';

import { AnswersGrid } from '@/components/ui/answers-grid';
import { ExerciseComplete } from '@/components/ui/exercise-complete';
import { LetterCard } from '@/components/ui/letter-card';
import { LetterCardSuccessCover } from '@/components/ui/letter-card-success-cover';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/context/auth/auth-context';
import { db } from '@/lib/database';
import { AnswerService } from '@/lib/services/answer-service';
import { LetterService } from '@/lib/services/letter-service';
import { ExerciseState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

export default function Learning() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [exercise, setExercise] = useState<ExerciseState>({
    mode:
      (searchParams.get('mode') as 'marathi-to-latin' | 'latin-to-marathi') ||
      'marathi-to-latin',
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
    new AnswerService(exercise.mode, 1)
  );

  // useEffect(() => {
  //   const initializeExercise = async () => {
  //     if (!userId) return;

  //     const progress = await db.getUserProgress(userId);
  //     const availableLetters = selectLettersBasedOnProgress(progress);
  //     const selectedLetters = availableLetters
  //       .sort(() => Math.random() - 0.5)
  //       .slice(0, exercise.size);

  //     setExercise(prev => ({
  //       ...prev,
  //       letters: selectedLetters,
  //       currentIndex: 0,
  //       score: 0,
  //       mistakes: 0,
  //       history: [],
  //     }));
  //   };

  //   initializeExercise();
  // }, [userId, exercise.mode, exercise.size]);

  // const selectLettersBasedOnProgress = (progress: UserProgress) => {
  //   const exerciseProgress = progress.exercises[exercise.mode];
  //   if (!exerciseProgress || exerciseProgress.completedLetters.length < 4) {
  //     // For beginners, start with the first 8 letters
  //     return marathiAlphabet.slice(0, 8);
  //   }

  //   // Mix mastered and new letters
  //   const masteredLetters = marathiAlphabet.filter(l =>
  //     exerciseProgress.completedLetters.includes(
  //       exercise.mode === 'marathi-to-latin' ? l.marathi : l.latin
  //     )
  //   );
  //   const newLetters = marathiAlphabet.filter(
  //     l =>
  //       !exerciseProgress.completedLetters.includes(
  //         exercise.mode === 'marathi-to-latin' ? l.marathi : l.latin
  //       )
  //   );

  //   return [...masteredLetters, ...newLetters];
  // };

  const handleAnswer = async (answer: string) => {
    if (isAnimating) return;

    const currentLetter = exercise.letters[exercise.currentIndex];
    const correctAnswer =
      exercise.mode === 'marathi-to-latin'
        ? currentLetter.latin
        : currentLetter.marathi;
    const isCorrect = answer === correctAnswer;
    setIsAnimating(true);
    setSelectedAnswer(answer);

    // Update progress
    const progress = await db.getUserProgress(userId!);
    const letterKey =
      exercise.mode === 'marathi-to-latin'
        ? currentLetter.marathi
        : currentLetter.latin;

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
    if (
      stats.lastTenAttempts.length >= 10 &&
      stats.lastTenAttempts.every(attempt => attempt) &&
      !progress.exercises[exercise.mode].completedLetters.includes(letterKey)
    ) {
      progress.exercises[exercise.mode].completedLetters.push(letterKey);
    }

    await db.updateUserProgress(userId!, progress);

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

  const currentLetter = exercise.letters[exercise.currentIndex];
  const answers = useMemo(
    () =>
      answerService.current.generateAnswers(
        exercise.mode === 'marathi-to-latin'
          ? currentLetter.latin
          : currentLetter.marathi
      ),
    [currentLetter.latin, currentLetter.marathi, exercise.mode]
  );

  if (showStats) {
    return (
      <ExerciseComplete
        exercise={exercise}
        onTryAgain={() => {
          setExercise(prev => ({
            ...prev,
            currentIndex: 0,
            score: 0,
            mistakes: 0,
            history: [],
          }));
          setShowStats(false);
        }}
        onExit={() => router.push('/dashboard')}
      />
    );
  }

  const displayLetter =
    exercise.mode === 'marathi-to-latin'
      ? currentLetter.marathi
      : currentLetter.latin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-center">
            {exercise.mode === 'marathi-to-latin'
              ? 'Identify the Marathi Letter'
              : 'Write in Marathi'}
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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative"
          >
            <LetterCard
              letter={displayLetter}
              instruction={
                'Choose the correct ' +
                (exercise.mode === 'marathi-to-latin' ? 'Latin' : 'Marathi') +
                ' representation'
              }
              className={cn('z-0 transition-all duration-300', {
                'blur-sm':
                  isAnimating && selectedAnswer === currentLetter.latin,
              })}
            />
            {isAnimating && selectedAnswer === currentLetter.latin && (
              <LetterCardSuccessCover />
            )}
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
