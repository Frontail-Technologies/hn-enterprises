import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function SectionCard({ title, action, className, children }: SectionCardProps) {
  return (
    <div className={cn('bg-card rounded-lg border border-border/70 p-3', className)}>
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/60 gap-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}
