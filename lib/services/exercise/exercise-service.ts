import { ExerciseMode } from '../../types';
import { Letter, LetterService } from '../letter-service';
import { progressService } from '../progress/progress-service';
import { Exercise } from './types';

export class ExerciseService {
  public async getExercise(userId: string, module: ExerciseMode): Promise<Exercise> {
    const userProgress = await progressService.getUserProgress(userId);

    let letters: Letter[] = [];

    if (module === 'marathi-to-latin') {
      letters = LetterService.getRandomMarathiLetters(8, 1);
    } else if (module === 'latin-to-marathi') {
      letters = LetterService.getRandomLatinLetters(8, 1);
    }

    return {
      mode: module,
      size: 8,
      letters,
    };
  }
}

export const exerciseService = new ExerciseService();

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
