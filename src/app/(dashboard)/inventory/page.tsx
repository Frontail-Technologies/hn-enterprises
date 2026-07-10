import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Inventory & Material' }
export default function Page() {
  return (
    <div>
      <div className={"mb-6"}>
        <h1 className={"text-xl font-bold text-foreground"}>Inventory & Material</h1>
        <p className={"text-sm text-muted-foreground mt-0.5"}>Stock management, purchase and material issue. (Module 13)</p>
      </div>
      <div className={"bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm shadow-sm"}>
        This module will be implemented in a future sprint.
      </div>
    </div>
  )
}
