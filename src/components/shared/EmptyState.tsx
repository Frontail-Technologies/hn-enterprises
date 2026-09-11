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
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center mb-3">
        {icon ?? <FolderOpen size={22} className="text-muted-foreground" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="app-primary-action bg-primary hover:bg-primary/90 text-white text-sm h-9"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
