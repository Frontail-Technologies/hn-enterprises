import { cookies } from 'next/headers'
import { DashboardGate } from '@/components/layout/DashboardGate'

// The sidebar remembers open/collapsed in this cookie (components/ui/sidebar.tsx).
const SIDEBAR_COOKIE = 'sidebar_state'

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  // Read on the server so the loading skeleton and the real sidebar start at
  // the saved width on the very first paint.
  const sidebarOpen = (await cookies()).get(SIDEBAR_COOKIE)?.value !== 'false'
  return <DashboardGate sidebarOpen={sidebarOpen}>{children}</DashboardGate>
}
