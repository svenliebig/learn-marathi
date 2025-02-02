import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExerciseState } from '@/lib/types';
import Link from 'next/link';

interface ExerciseCompleteProps {
  exercise: ExerciseState;
  onTryAgain: () => void;
  onExit?: () => void;
  showSignUp?: boolean;
}

export function ExerciseComplete({
  exercise,
  onTryAgain,
  onExit,
  showSignUp = false,
}: ExerciseCompleteProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">Exercise Complete!</h2>
        <div className="space-y-4 mb-8">
          <p>Correct Answers: {exercise.score}</p>
          <p>Mistakes: {exercise.mistakes}</p>
          <p>
            Accuracy: {((exercise.score / exercise.size) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="space-y-4">
          {showSignUp ? (
            <Link href="/login">
              <Button className="w-full">Sign Up to Continue Learning</Button>
            </Link>
          ) : (
            <Button className="w-full" onClick={onExit}>
              Back to Dashboard
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={onTryAgain}>
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
}
