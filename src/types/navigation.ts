import { UserRole } from './auth'

export interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  badge?: number
  children?: NavItem[]
  allowedRoles?: UserRole[]
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}
