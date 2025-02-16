import { Card } from '@/components/ui/card';
import { LetterService } from '@/lib/services/letter-service';
import { Challenge } from '@/lib/services/progress/types';
import { cn } from '@/lib/utils';
import { AudioButton } from './audio-button';

type MistakePattern = {
  letter: string;
  latinLetter: string;
  totalAttempts: number;
  commonMistakes: {
    answer: string;
    count: number;
    percentage: number;
  }[];
};

interface CommonMistakesProps {
  challenges: Challenge[];
  className?: string;
}

function analyzeMistakePatterns(challenges: Challenge[]): MistakePattern[] {
  // Group mistakes by letter
  const patterns = challenges
    // only show mistakes on letters that are not mastered
    .filter(challenge => challenge.flawless < 5)
    // only show letters that have mistakes
    .filter(challenge => challenge.mistakes.length > 0)
    .map(challenge => {
      const mistakeCounts: { [key: string]: number } = {};
      challenge.mistakes.forEach(mistake => {
        mistakeCounts[mistake.answer] = (mistakeCounts[mistake.answer] || 0) + 1;
      });

      const commonMistakes = Object.entries(mistakeCounts)
        .map(([answer, count]) => ({
          answer,
          count,
          percentage: (count / challenge.attempts) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Top 3 mistakes

      return {
        letter: challenge.letter,
        latinLetter: LetterService.getLatinLetter(challenge.letter),
        totalAttempts: challenge.attempts,
        commonMistakes,
      };
    })
    .sort((a, b) => (b.commonMistakes[0]?.count || 0) - (a.commonMistakes[0]?.count || 0))
    .slice(0, 3); // Top 3 problematic letters

  return patterns;
}

export function CommonMistakes({ challenges, className }: CommonMistakesProps) {
  const patterns = analyzeMistakePatterns(challenges);

  if (patterns.length === 0) {
    return null;
  }

  return (
    <Card className={cn('p-6', className)}>
      <h2 className="text-xl font-semibold mb-4">Learning Insights</h2>
      <div className="space-y-6">
        {patterns.map(pattern => (
          <div key={pattern.letter} className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{pattern.letter}</span>
                <AudioButton letter={pattern.letter} />
              </div>
              <span className="text-sm text-muted-foreground">({pattern.latinLetter})</span>
            </div>

            <div className="pl-4 border-l-2 border-muted">
              <p className="text-sm text-muted-foreground mb-2">Common confusions:</p>
              {pattern.commonMistakes.map(mistake => (
                <div key={mistake.answer} className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mistake.answer}</span>
                      <span className="text-sm text-muted-foreground">
                        ({Math.round(mistake.percentage)}% of attempts)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${mistake.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
