import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CommonMistakes } from '@/components/ui/common-mistakes';
import { Progress } from '@/components/ui/progress';
import { getUserId } from '@/lib/services/auth/actions';
import { progressService } from '@/lib/services/progress/progress-service';
import { ArrowRight, BookOpen, Clock, Star, Target, Trophy } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Dashboard() {
  const token = cookies().get('auth-token');
  const userId = await getUserId(token?.value);
  const progress = await progressService.getDashboardProgress(userId);
  const fullProgress = await progressService.getFullUserProgress(userId);

  if (!progress || !fullProgress) {
    return <div>No progress found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col max-w-4xl mx-auto gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
          <Link href="/learning">
            <Button className="gap-2">
              Continue Learning <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold">Daily Streak</h3>
                <p className="text-2xl font-bold">{progress.streak} days</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Accuracy</h3>
                <p className="text-2xl font-bold">{progress.accuracy}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Mastery Level</h3>
                <p className="text-2xl font-bold">{progress.masteryLevel}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          {/* Overall Progress */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
            <Progress value={progress.overallProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {progress.overallProgress}% of Marathi alphabet mastered
            </p>
          </Card>
        </div>

        {/* Exercise Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {progress.modules.map(module => (
            <Card key={module.module.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Trophy className="w-8 h-8 text-primary mb-2" />
                  <h3 className="text-lg font-semibold">{module.module.name}</h3>
                  <p className="text-sm text-muted-foreground">{module.module.description}</p>
                </div>
                <Link href={`/learning?mode=${module.module.id}`}>
                  <Button variant="outline" size="sm">
                    Practice
                  </Button>
                </Link>
              </div>
              <Progress value={(module.mastered / module.total) * 100} />
              <div className="mt-2 text-sm text-muted-foreground">
                {module.mastered} of {module.total} letters mastered
              </div>
            </Card>
          ))}
        </div>

        {/* Common Mistakes */}
        <CommonMistakes challenges={fullProgress.challenges} />

        {/* Marathi Alphabet */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-1 col-span-3">
            <div className="flex items-start justify-between mb-4">
              <div>
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <h3 className="text-lg font-semibold">Marathi Alphabet</h3>
                <p className="text-sm text-muted-foreground">View all letters and your progress</p>
              </div>
              <Link href="/dashboard/marathi">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card>
          <Card className="p-6 col-span-3 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {progress.modules.map(module => (
                <div key={module.module.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{module.module.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {module.mastered} of {module.total} letters mastered
                    </p>
                  </div>
                  <Link href={`/learning?mode=${module.module.id}`}>
                    <Button variant="ghost" size="sm">
                      Continue
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
