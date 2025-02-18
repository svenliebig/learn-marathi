import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CommonMistakes } from '@/components/ui/common-mistakes'
import { Progress } from '@/components/ui/progress'
import { getUserId } from '@/lib/services/auth/actions'
import { progressService } from '@/lib/services/progress/progress-service'
import { BookOpen, Settings, Trophy } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { AccuracyCard } from './_components/accuracy-card'
import { DailyStreakCard } from './_components/daily-streak-card'
import { LevelCard } from './_components/level-card'

export default async function Dashboard() {
  const token = cookies().get('auth-token')
  const userId = await getUserId(token?.value)
  const progress = await progressService.getDashboardProgress(userId)
  const fullProgress = await progressService.getResolvedUserProgress(userId)

  if (!progress || !fullProgress) {
    return <div>No progress found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col max-w-4xl mx-auto gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
          <Button variant="ghost" size="icon" className="hover:bg-accent" asChild>
            <Link href="/settings">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <DailyStreakCard streak={progress.streak} className="p-6" />
          <AccuracyCard accuracy={progress.accuracy} className="p-6" />
          <LevelCard masteryLevel={progress.masteryLevel} className="p-6" />
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
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/learning?mode=${module.module.id}`}>Practice</Link>
                </Button>
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
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/marathi">View All</Link>
              </Button>
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/learning?mode=${module.module.id}`}>Continue</Link>
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
