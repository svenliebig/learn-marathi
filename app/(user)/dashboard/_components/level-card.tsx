import { Card } from '@/components/ui/card'
import { MasteryLevel } from '@/lib/services/progress/types'
import { cn } from '@/lib/utils'
import { GraduationCap, Lightbulb, Medal, Rocket, Sparkles } from 'lucide-react'

interface LevelCardProps {
  masteryLevel: MasteryLevel
  className?: string
}

const LEVEL_CONFIG = {
  Novice: {
    icon: Lightbulb,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  Beginner: {
    icon: Rocket,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  Intermediate: {
    icon: Sparkles,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  Advanced: {
    icon: Medal,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  Master: {
    icon: GraduationCap,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
}

export function LevelCard({ masteryLevel, className }: LevelCardProps) {
  const config = LEVEL_CONFIG[masteryLevel]
  const Icon = config.icon

  return (
    <Card className={className}>
      <div className={cn('flex items-center gap-4 relative overflow-hidden')}>
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('w-8 h-8', config.color)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Level</h3>
          <p className={cn('text-2xl font-bold', config.color)}>{masteryLevel}</p>
        </div>
      </div>
    </Card>
  )
}
