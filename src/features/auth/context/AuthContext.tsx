'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { AuthSession, AuthUser, LoginCredentials } from '@/types/auth'
import { authService } from '../services/auth.service'

interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    authService.getCurrentUser().then((user) => {
      if (!mounted) return
      setSession(user ? { user, token: '', expiresAt: '' } : null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const user = await authService.login(credentials)
    setSession({ user, token: '', expiresAt: '' })
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setSession(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const user = await authService.getCurrentUser()
    setSession(user ? { user, token: '', expiresAt: '' } : null)
  }, [])

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    isAuthenticated: session !== null,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
