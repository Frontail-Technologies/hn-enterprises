import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ProgressBar({ value, max = 100, className, showLabel = false, size = 'sm' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-muted rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-foreground w-8 text-right">{pct}%</span>
      )}
    </div>
  )
}
