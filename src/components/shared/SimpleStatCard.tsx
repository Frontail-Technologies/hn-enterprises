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
    <div className={cn('bg-card rounded-xl ring-1 ring-foreground/5 p-4 shadow-sm flex items-center gap-3', className)}>
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconClassName ?? 'bg-primary/10 text-primary')}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium leading-tight">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1 leading-none">{value}</p>
        {helperText && (
          <p className="text-xs text-muted-foreground mt-1 leading-tight">{helperText}</p>
        )}
      </div>
    </div>
  )
}
