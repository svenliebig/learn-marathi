import { getUserId } from '@/lib/services/auth/actions';
import { exerciseService } from '@/lib/services/exercise/exercise-service';
import { ExerciseMode } from '@/lib/types';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

type Params = {
  mode: ExerciseMode;
};

const Exercise = dynamic(() => import('@/components/exercise'), { ssr: false });

export default async function Learning({ searchParams }: { searchParams: Params }) {
  const token = cookies().get('auth-token');
  const userId = await getUserId(token?.value);

  const createdExercise = await exerciseService.getExercise(userId, searchParams.mode);

  return <Exercise userId={userId} exercise={createdExercise} />;
}
