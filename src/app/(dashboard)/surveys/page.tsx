import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Surveys' }
export default function Page() {
  return (
    <div>
      <div className={"mb-6"}>
        <h1 className={"text-xl font-bold text-foreground"}>Surveys</h1>
        <p className={"text-sm text-muted-foreground mt-0.5"}>Survey management and workable status. (Module 6)</p>
      </div>
      <div className={"bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm shadow-sm"}>
        This module will be implemented in a future sprint.
      </div>
    </div>
  )
}
