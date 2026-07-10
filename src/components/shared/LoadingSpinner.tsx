export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeMap[size]} border-2 border-border border-t-primary rounded-full animate-spin`}
      />
      {size !== 'sm' && (
        <p className="text-xs text-muted-foreground font-medium">Loading...</p>
      )}
    </div>
  )
}
