'use server';

import { ExerciseMode } from '@/lib/types';
import { progressService } from './progress-service';

export async function updateChallengeByUserId(
  userId: string,
  letter: string,
  answer: string,
  mode: ExerciseMode
) {
  console.log('[Action] updateChallengeByUserId', { userId, letter, answer, mode });
  return await progressService.updateChallengeByUserId(userId, letter, answer, mode);
}
