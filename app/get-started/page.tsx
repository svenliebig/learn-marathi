'use client';

import { AnswersGrid } from '@/components/ui/answers-grid';
import { ExerciseComplete } from '@/components/ui/exercise-complete';
import { LetterCard } from '@/components/ui/letter-card';
import { LetterCardSuccessCover } from '@/components/ui/letter-card-success-cover';
import { Progress } from '@/components/ui/progress';
import { AnswerService } from '@/lib/services/answer-service';
import { LetterService } from '@/lib/services/letter-service';
import { ExerciseState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
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

    const audio = new Audio(`/audio/marathi/${currentLetter.marathi}.mp3`);
    audio.play();

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
      <ExerciseComplete
        exercise={exercise}
        onTryAgain={() => {
          setExercise({
            ...exercise,
            currentIndex: 0,
            score: 0,
            mistakes: 0,
            history: [],
          });
          setShowStats(false);
        }}
        showSignUp
      />
    );
  }

  const displayLetter =
    exercise.mode === 'marathi-to-latin'
      ? currentLetter.marathi
      : currentLetter.latin;

  const correctAnswer =
    exercise.mode === 'marathi-to-latin'
      ? currentLetter.latin
      : currentLetter.marathi;

  const isCorrect = correctAnswer === selectedAnswer;

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
                'blur-sm': isAnimating && isCorrect,
              })}
            />
            {isAnimating && isCorrect && <LetterCardSuccessCover />}
          </motion.div>
        </AnimatePresence>

        <AnswersGrid
          answers={answers}
          onAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
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
