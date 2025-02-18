import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface DailyStreakCardProps {
  streak: number
  className?: string
}

export function DailyStreakCard({ streak, className }: DailyStreakCardProps) {
  const streakConfig = {
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  }

  return (
    <Card className={className}>
      <div className={cn('flex items-center gap-4 relative overflow-hidden')}>
        <div className={cn('p-2 rounded-lg', streakConfig.bgColor)}>
          <Star className={cn('w-8 h-8', streakConfig.color)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Daily Streak</h3>
          <p className={cn('text-2xl font-bold', streakConfig.color)}>{streak} days</p>
        </div>
      </div>
    </Card>
  )
}
