'use client';

import { motion } from 'framer-motion';

import { AnswerService } from '@/lib/services/answer-service';
import { audioService } from '@/lib/services/audio-service';
import { createExercise } from '@/lib/services/exercise/actions';
import { Exercise as ExerciseType } from '@/lib/services/exercise/types';
import { Letter } from '@/lib/services/letter-service';
import { updateChallengeByUserId, updateProgress } from '@/lib/services/progress/actions';
import { ExerciseState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { AnswersGrid } from './ui/answers-grid';
import { ExerciseComplete } from './ui/exercise-complete';
import { LetterCard } from './ui/letter-card';
import { LetterCardSuccessCover } from './ui/letter-card-success-cover';
import { Progress } from './ui/progress';

export default function Exercise({
  userId,
  exercise: createdExercise,
}: {
  userId: string;
  exercise: ExerciseType;
}) {
  const router = useRouter();

  const [exercise, setExercise] = useState<ExerciseState>(
    useMemo(
      () => ({
        mode: createdExercise.mode,
        size: createdExercise.size,
        currentIndex: 0,
        letters: createdExercise.letters.map((l: Letter) => {
          return {
            ...l,
            audio: audioService.getLetterAudio(l.marathi)!,
          };
        }),
        answers: [],
        correctAnswer: '',
        score: 0,
        mistakes: 0,
        history: [],
      }),
      []
    )
  );

  const [showStats, setShowStats] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const answerService = useRef<AnswerService>(new AnswerService(exercise.mode, 1));

  const handleAnswer = async (answer: string) => {
    if (isAnimating) return;

    const currentLetter = exercise.letters[exercise.currentIndex];
    const correctAnswer =
      exercise.mode === 'marathi-to-latin' ? currentLetter.latin : currentLetter.marathi;
    const isCorrect = answer === correctAnswer;

    setIsAnimating(true);
    setSelectedAnswer(answer);

    await (currentLetter as any).audio.play();

    // Update progress via API
    const letterKey =
      exercise.mode === 'marathi-to-latin' ? currentLetter.marathi : currentLetter.latin;

    await updateChallengeByUserId(userId, letterKey, answer, exercise.mode);
    await updateProgress(userId, exercise.mode, letterKey, isCorrect);

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
        exercise.mode === 'marathi-to-latin' ? currentLetter.latin : currentLetter.marathi
      ),
    [currentLetter.latin, currentLetter.marathi, exercise.mode]
  );

  if (showStats) {
    return (
      <ExerciseComplete
        exercise={exercise}
        onTryAgain={async () => {
          const newExercise = await createExercise(userId, exercise.mode);

          setExercise(prev => ({
            ...prev,
            currentIndex: 0,
            score: 0,
            letters: newExercise.letters.map((l: Letter) => ({
              ...l,
              audio: audioService.getLetterAudio(l.marathi)!,
            })),
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
    exercise.mode === 'marathi-to-latin' ? currentLetter.marathi : currentLetter.latin;

  const correctAnswer =
    exercise.mode === 'marathi-to-latin' ? currentLetter.latin : currentLetter.marathi;

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
          <Progress value={(exercise.currentIndex / exercise.size) * 100} className="h-2" />
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
