import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'GC Uploads' }
export default function Page() {
  return (
    <div>
      <div className={"mb-6"}>
        <h1 className={"text-xl font-bold text-foreground"}>GC Uploads</h1>
        <p className={"text-sm text-muted-foreground mt-0.5"}>GC drawing uploads and approvals. (Module 8)</p>
      </div>
      <div className={"bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm shadow-sm"}>
        This module will be implemented in a future sprint.
      </div>
    </div>
  )
}
