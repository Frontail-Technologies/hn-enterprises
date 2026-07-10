export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'project_manager'
  | 'accounts'
  | 'store'
  | 'supervisor'
  | 'field_executive'
  | 'viewer'

export interface AuthUser {
  id: string
  username: string
  fullName: string
  role: UserRole
  assignedProjects: string[]
  assignedCity?: string
  avatar?: string
  lastLogin?: string
  isActive: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthSession {
  user: AuthUser
  token: string
  expiresAt: string
}
