import { getUserId } from '@/lib/services/auth/actions'
import { exerciseService } from '@/lib/services/exercise/exercise-service'
import { ExerciseMode } from '@/lib/types'
import dynamic from 'next/dynamic'

type Params = {
  mode: ExerciseMode
}

const Exercise = dynamic(() => import('@/components/exercise'))

export default async function Learning(props: { searchParams: Promise<Params> }) {
  const searchParams = await props.searchParams
  const userId = await getUserId()

  const createdExercise = await exerciseService.getExercise(userId, searchParams.mode)

  return <Exercise userId={userId} exercise={createdExercise} />
}
