'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />

      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          collapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <Header onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
