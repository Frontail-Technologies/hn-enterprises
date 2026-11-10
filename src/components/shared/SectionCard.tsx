import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function SectionCard({ title, description, action, className, children }: SectionCardProps) {
  return (
    <section className={cn('min-w-0 rounded-card border border-border bg-card p-5 shadow-card', className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-section-title">{title}</h2>
          {description ? <p className="text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
      </header>
      {children}
    </section>
  )
}
