'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Session couldn't be confirmed (expired/invalid cookie, or the backend
    // is unreachable so /auth/me failed) - send to login instead of rendering
    // a blank page. proxy.ts only checks whether the auth cookie is present,
    // not whether it's still valid or the backend is up, so it can't catch
    // this case on its own.
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // Role gate - only admins may use the dashboard.
    if (user && user.role !== 'super_admin' && user.role !== 'admin') {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (user && user.role !== 'super_admin' && user.role !== 'admin') return null

  return <DashboardLayout>{children}</DashboardLayout>
}
