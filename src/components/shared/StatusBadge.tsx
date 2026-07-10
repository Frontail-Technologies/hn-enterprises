import { cn } from '@/lib/utils'

/**
 * StatusBadge — all colors come from CSS variables defined in globals.css.
 * Status groups map to semantic token classes, not raw color utilities.
 *
 * To change status colors, update the --status-* variables in globals.css.
 * Components here remain unchanged.
 */

export type StatusValue =
  | 'Draft'
  | 'Submitted'
  | 'In Review'
  | 'Approved'
  | 'Rejected'
  | 'Sent Back'
  | 'In Progress'
  | 'Completed'
  | 'Pending'
  | 'On Hold'
  | 'Cancelled'
  | 'Archived'
  | 'Active'
  | 'Inactive'
  | 'Not Started'
  | 'Workable'
  | 'Not Workable'
  | 'Partially Workable'

// Maps each status to a semantic group
// Colors for each group are defined in globals.css as --status-* variables
type StatusGroup = 'success' | 'warning' | 'primary' | 'info' | 'purple' | 'destructive' | 'neutral'

const STATUS_GROUP: Record<StatusValue, StatusGroup> = {
  Approved:            'success',
  Completed:           'success',
  Active:              'success',
  Workable:            'success',
  Pending:             'warning',
  'In Review':         'warning',
  'Partially Workable':'warning',
  'In Progress':       'primary',
  Submitted:           'info',
  'Sent Back':         'purple',
  Rejected:            'destructive',
  Cancelled:           'destructive',
  'Not Workable':      'destructive',
  Draft:               'neutral',
  'On Hold':           'neutral',
  Archived:            'neutral',
  Inactive:            'neutral',
  'Not Started':       'neutral',
}

// Tailwind classes that reference CSS variables from globals.css
const GROUP_CLASSES: Record<StatusGroup, string> = {
  success:     'bg-status-success-bg text-status-success-fg border-status-success/20',
  warning:     'bg-status-warning-bg text-status-warning-fg border-status-warning/20',
  primary:     'bg-primary/10 text-accent-foreground border-primary/20',
  info:        'bg-status-info-bg text-status-info-fg border-status-info/20',
  purple:      'bg-status-purple-bg text-status-purple-fg border-status-purple/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  neutral:     'bg-muted text-muted-foreground border-border',
}

interface StatusBadgeProps {
  status: StatusValue | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const group = STATUS_GROUP[status as StatusValue] ?? 'neutral'
  const colorClasses = GROUP_CLASSES[group]

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 border rounded-full',
        colorClasses,
        className
      )}
    >
      {status}
    </span>
  )
}
