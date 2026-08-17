export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'supervisor'
  | 'viewer'
  | 'project_manager'
  | 'accounts'
  | 'store'

export interface AuthUser {
  id: string
  username: string
  fullName: string
  name?: string
  email?: string
  mobile?: string | null
  role: UserRole
  status?: string
  assignedProjects?: string[]
  assignedCity?: string
  avatar?: string
  lastLogin?: string | null
  lastLoginAt?: string | null
  isActive?: boolean
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
