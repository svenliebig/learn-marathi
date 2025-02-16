export interface MarathiLetter {
  marathi: string;
  latin: string;
  difficulty: number;
}

export type ExerciseMode =
  | 'marathi-to-latin'
  | 'latin-to-marathi'
  | 'translate';
export type ExerciseSize = 8 | 16;

export interface ExerciseState {
  mode: ExerciseMode;
  size: ExerciseSize;
  currentIndex: number;
  letters: (MarathiLetter & { audio?: HTMLAudioElement })[];
  answers: string[];
  correctAnswer: string;
  score: number;
  mistakes: number;
  history: {
    letter: string;
    correct: boolean;
    timeTaken?: number;
  }[];
}
