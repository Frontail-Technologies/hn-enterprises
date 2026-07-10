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
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const existing = authService.getCurrentSession()
    setSession(existing)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const newSession = await authService.login(credentials)
    setSession(newSession)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
  }, [])

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    isAuthenticated: session !== null,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
