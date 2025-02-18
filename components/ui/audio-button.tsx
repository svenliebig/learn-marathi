'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Volume2 } from 'lucide-react'
import { useState } from 'react'

interface AudioButtonProps {
  letter: string
  className?: string
}

export function AudioButton({ letter, className }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = async () => {
    if (isPlaying) return

    try {
      setIsPlaying(true)
      // You'll need to replace this with your actual audio file URL pattern
      const audio = new Audio(`/audio/marathi/${letter}.mp3`)
      await audio.play()
      audio.onended = () => setIsPlaying(false)
    } catch (error) {
      console.error('Failed to play audio:', error)
      setIsPlaying(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(className, isPlaying && 'opacity-50')}
      onClick={playAudio}
      aria-disabled={isPlaying}
    >
      <Volume2 className={`h-4 w-4 ${isPlaying ? 'text-primary' : ''}`} />
      <span className="sr-only">Play pronunciation</span>
    </Button>
  )
}
