import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const STAT_CARDS = [
  'Total Projects', 'Active Sites', 'Pending Surveys', 'Pending GC Drawings',
  'Pending JMR', 'Reports Pending Approval', 'Billing Done', 'Billing Pending',
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome to HN Enterprises. This page will be fully built in Module 7.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium mb-2">{card}</p>
            <p className="text-2xl font-bold text-foreground">—</p>
          </div>
        ))}
      </div>
    </div>
  )
}
