'use server';

import { ExerciseMode } from '@/lib/types';
import { exerciseService } from './exercise-service';

export async function createExercise(userId: string, mode: ExerciseMode) {
  return exerciseService.getExercise(userId, mode);
}
