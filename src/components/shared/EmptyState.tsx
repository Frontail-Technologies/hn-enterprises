import { Button } from '@/components/ui/button'
import { FolderOpenIcon as FolderOpen } from '@phosphor-icons/react/dist/ssr'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
        {icon ?? <FolderOpen size={28} className="text-muted-foreground" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
