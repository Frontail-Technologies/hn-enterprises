'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { DashboardLayout } from './DashboardLayout'
import { AppShellSkeleton } from './AppShellSkeleton'

const isAdmin = (role: string | undefined) => role === 'super_admin' || role === 'admin'

/**
 * Auth gate for the dashboard. While the session is checked (and while a
 * signed-out or non-admin user is redirected to /login) it shows a skeleton of
 * the real shell, so the dashboard replaces it in place without a blank flash.
 */
export function DashboardGate({ sidebarOpen, children }: { sidebarOpen: boolean; children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (user && !isAdmin(user.role)) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading || !isAuthenticated || (user && !isAdmin(user.role))) {
    return <AppShellSkeleton sidebarOpen={sidebarOpen} />
  }

  return <DashboardLayout sidebarDefaultOpen={sidebarOpen}>{children}</DashboardLayout>
}
