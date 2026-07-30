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
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
      return
    }

    if (!isLoading && isAuthenticated && user) {
      const allowed = user.role === 'super_admin' || user.role === 'admin'
      if (!allowed) {
        router.replace('/login')
      }
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
