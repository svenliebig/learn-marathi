import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Target } from 'lucide-react'

interface AccuracyCardProps {
  accuracy: number
  className?: string
}

export function AccuracyCard({ accuracy, className }: AccuracyCardProps) {
  const accuracyConfig = {
    icon: Target,
    color:
      accuracy >= 90
        ? 'text-green-500'
        : accuracy >= 70
          ? 'text-blue-500'
          : accuracy >= 50
            ? 'text-yellow-500'
            : 'text-red-500',
    bgColor:
      accuracy >= 90
        ? 'bg-green-500/10'
        : accuracy >= 70
          ? 'bg-blue-500/10'
          : accuracy >= 50
            ? 'bg-yellow-500/10'
            : 'bg-red-500/10',
  }

  return (
    <Card className={className}>
      <div className={cn('flex items-center gap-4 relative overflow-hidden')}>
        <div className={cn('p-2 rounded-lg', accuracyConfig.bgColor)}>
          <Target className={cn('w-8 h-8', accuracyConfig.color)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Accuracy</h3>
          <p className={cn('text-2xl font-bold', accuracyConfig.color)}>{accuracy}%</p>
        </div>
      </div>
    </Card>
  )
}
