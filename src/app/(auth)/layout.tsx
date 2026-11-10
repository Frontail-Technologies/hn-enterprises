export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-card">
      {/* Desktop app only: lets the window be dragged by its top edge (there is no top bar here). */}
      <div aria-hidden="true" className="app-drag-strip app-titlebar fixed inset-x-0 top-0 z-50 h-8" />
      {children}
    </div>
  )
}
