import { Button } from '@/components/ui/button'
import { EmptyIllustration, type EmptyIllustrationName } from './illustrations/EmptyIllustration'

export type { EmptyIllustrationName }

interface EmptyStateProps {
  /** Custom icon; when set it replaces the illustration. */
  icon?: React.ReactNode
  illustration?: EmptyIllustrationName
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, illustration = 'records', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      {icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : (
        <EmptyIllustration name={illustration} className="mb-3" />
      )}
      <h3 className="mb-1 text-[15px] font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
