import { AudioButton } from '@/components/ui/audio-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { Progress } from '@/components/ui/progress';
import { marathiAlphabet } from '@/lib/marathi-data';
import { getUserId } from '@/lib/services/auth/actions';
import { progressService } from '@/lib/services/progress/progress-service';
import { ArrowLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function MarathiAlphabet() {
  const token = cookies().get('auth-token');
  const userId = await getUserId(token?.value);
  const progress = await progressService.getUserProgress(userId);

  const getLetterProgress = (letter: string, mode: 'marathi-to-latin' | 'latin-to-marathi') => {
    if (!progress?.exercises?.[mode]?.letterStats?.[letter]) return 0;
    const stats = progress.exercises[mode].letterStats[letter];
    const lastTenAttempts = stats.lastTenAttempts || [];
    return (lastTenAttempts.filter(attempt => attempt).length / 10) * 100;
  };

  const isLetterMastered = (letter: string, mode: 'marathi-to-latin' | 'latin-to-marathi') => {
    return progress?.exercises?.[mode]?.completedLetters.includes(letter) || false;
  };

  const vowels = marathiAlphabet.filter(letter => letter.type === 'vowel');
  const consonants = marathiAlphabet.filter(letter => letter.type === 'consonant');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Marathi Alphabet</h1>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Vowels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vowels.map(letter => (
              <Card
                key={letter.marathi}
                className={`p-4 ${
                  isLetterMastered(letter.marathi, 'marathi-to-latin') ? 'border-green-500' : ''
                }`}
              >
                <div className="text-center mb-2">
                  <div className="relative">
                    <div className="absolute top-0 left-0">
                      <CopyButton text={letter.marathi} />
                    </div>
                    <div className="absolute top-0 right-0">
                      <AudioButton letter={letter.marathi} />
                    </div>
                    <div className="pt-12">
                      <span className="text-4xl font-bold">{letter.marathi}</span>
                      <span className="block text-sm text-muted-foreground mt-2">
                        {letter.latin}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={getLetterProgress(letter.marathi, 'marathi-to-latin')}
                  className={`h-2 ${
                    isLetterMastered(letter.marathi, 'marathi-to-latin')
                      ? 'bg-green-100 [&>div]:bg-green-500'
                      : ''
                  }`}
                />
                {isLetterMastered(letter.marathi, 'marathi-to-latin') && (
                  <p className="text-xs text-center text-green-600 mt-1">Learned</p>
                )}
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Consonants</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {consonants.map(letter => (
              <Card
                key={letter.marathi}
                className={`p-4 ${
                  isLetterMastered(letter.marathi, 'marathi-to-latin') ? 'border-green-500' : ''
                }`}
              >
                <div className="text-center mb-2">
                  <div className="relative">
                    <div className="absolute top-0 left-0">
                      <CopyButton text={letter.marathi} />
                    </div>
                    <div className="absolute top-0 right-0">
                      <AudioButton letter={letter.marathi} />
                    </div>
                    <div className="pt-12">
                      <span className="text-4xl font-bold">{letter.marathi}</span>
                      <span className="block text-sm text-muted-foreground mt-2">
                        {letter.latin}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress
                  value={getLetterProgress(letter.marathi, 'marathi-to-latin')}
                  className={`h-2 ${
                    isLetterMastered(letter.marathi, 'marathi-to-latin')
                      ? 'bg-green-100 [&>div]:bg-green-500'
                      : ''
                  }`}
                />
                {isLetterMastered(letter.marathi, 'marathi-to-latin') && (
                  <p className="text-xs text-center text-green-600 mt-1">Learned</p>
                )}
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
