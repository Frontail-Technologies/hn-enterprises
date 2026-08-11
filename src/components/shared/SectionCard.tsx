import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function SectionCard({ title, action, className, children }: SectionCardProps) {
  return (
    <div className={cn('bg-card rounded-card border border-border p-4', className)}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border gap-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}
