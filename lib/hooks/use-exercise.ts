import { useState, useEffect } from 'react';
import { ExerciseState, UserProgress } from '@/lib/types';
import { marathiAlphabet } from '@/lib/marathi-data';
import { db } from '@/lib/database';

export function useExercise(mode: 'marathi-to-latin' | 'latin-to-marathi', size: 8 | 16) {
  const [state, setState] = useState<ExerciseState>({
    mode,
    size,
    currentIndex: 0,
    letters: [],
    answers: [],
    correctAnswer: '',
    score: 0,
    mistakes: 0,
    history: [],
  });

  useEffect(() => {
    const initializeExercise = async () => {
      const progress = await db.getUserProgress('demo-user');
      const availableLetters = selectLettersBasedOnProgress(progress);
      const selectedLetters = availableLetters
        .sort(() => Math.random() - 0.5)
        .slice(0, size);

      setState(prev => ({
        ...prev,
        letters: selectedLetters,
      }));
    };

    initializeExercise();
  }, [mode, size]);

  const selectLettersBasedOnProgress = (progress: UserProgress) => {
    const exerciseProgress = progress.exercises[mode];
    if (!exerciseProgress || exerciseProgress.completedLetters.length < 4) {
      return marathiAlphabet.slice(0, 8);
    }
    
    const masteredLetters = marathiAlphabet.filter(l => 
      exerciseProgress.completedLetters.includes(mode === 'marathi-to-latin' ? l.marathi : l.latin)
    );
    const newLetters = marathiAlphabet.filter(l => 
      !exerciseProgress.completedLetters.includes(mode === 'marathi-to-latin' ? l.marathi : l.latin)
    );
    
    return [...masteredLetters, ...newLetters];
  };

  return {
    state,
    setState,
  };
}