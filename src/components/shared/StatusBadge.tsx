import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'


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
  | 'Sent'
  | 'Open'
  | 'Resolved'
  | 'Closed'


type StatusGroup = 'success' | 'warning' | 'primary' | 'info' | 'purple' | 'destructive' | 'neutral'

const STATUS_GROUP: Record<StatusValue, StatusGroup> = {
  Approved:            'success',
  Completed:           'success',
  Active:              'success',
  Workable:            'success',
  Sent:                'success',
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
  Open:                'warning',
  Resolved:            'success',
  Closed:              'neutral',
}


type GroupBadgeVariant = 'success' | 'warning' | 'primary' | 'info' | 'purple' | 'destructive' | 'secondary'

const GROUP_VARIANT: Record<StatusGroup, { variant: GroupBadgeVariant; border?: string }> = {
  success:     { variant: 'success' },
  warning:     { variant: 'warning' },
  primary:     { variant: 'primary' },
  info:        { variant: 'info' },
  purple:      { variant: 'purple' },
  destructive: { variant: 'destructive', border: 'border-destructive/20' },
  neutral:     { variant: 'secondary', border: 'border-border' },
}

interface StatusBadgeProps {
  status: StatusValue | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const group = STATUS_GROUP[status as StatusValue] ?? 'neutral'
  const { variant, border } = GROUP_VARIANT[group]

  return (
    <Badge variant={variant} className={cn(border, className)}>
      {status}
    </Badge>
  )
}
