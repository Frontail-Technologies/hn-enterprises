import { cn } from '@/lib/utils'

interface SimpleStatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  helperText?: string
  iconClassName?: string
  className?: string
}

export function SimpleStatCard({ label, value, icon, helperText, iconClassName, className }: SimpleStatCardProps) {
  return (
    <div className={cn('flex h-24 w-full min-w-32 max-w-44 flex-col justify-between rounded-xl border border-border/70 bg-card p-3 sm:w-40', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold leading-4 text-muted-foreground">{label}</p>
        <div className={cn('flex shrink-0 items-center justify-center rounded-lg p-1.5', iconClassName ?? 'bg-primary/10 text-primary')}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
        {helperText ? (
          <p className="mt-0.5 truncate text-xs font-medium leading-tight text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    </div>
  )
}
