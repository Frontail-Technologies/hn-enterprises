import { AuthSession, AuthUser, LoginCredentials } from '@/types/auth'
import { MOCK_USERS } from '../constants/mock-users'

const SESSION_KEY = 'buildpro_session'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = MOCK_USERS.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    )

    if (!user || !user.isActive) {
      throw new Error('Invalid username or password')
    }

    const { password: _, ...safeUser } = user

    const session: AuthSession = {
      user: safeUser,
      token: `mock-token-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }

    return session
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY)
    }
  },

  getCurrentSession: (): AuthSession | null => {
    if (typeof window === 'undefined') return null

    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    try {
      const session: AuthSession = JSON.parse(raw)
      // Check expiry
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      return session
    } catch {
      return null
    }
  },

  getCurrentUser: (): AuthUser | null => {
    const session = authService.getCurrentSession()
    return session?.user ?? null
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentSession() !== null
  },
}
