import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function SectionCard({ title, action, className, children }: SectionCardProps) {
  return (
    <div className={cn('bg-card rounded-xl ring-1 ring-foreground/5 p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60 gap-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}
