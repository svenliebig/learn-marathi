'use server';

import { ExerciseMode } from '@/lib/types';
import { progressService } from './progress-service';

export async function updateProgress(
  userId: string,
  mode: ExerciseMode,
  letterKey: string,
  isCorrect: boolean
) {
  console.log('[Action] updateProgress', { userId, mode, letterKey, isCorrect });
  return await progressService.updateProgress(userId, mode, letterKey, isCorrect);
}
