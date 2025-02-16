import { ExerciseMode } from '@/lib/types';
import { Letter } from '../letter-service';

export type Exercise = {
  mode: ExerciseMode;
  size: number;
  letters: Letter[];
};
