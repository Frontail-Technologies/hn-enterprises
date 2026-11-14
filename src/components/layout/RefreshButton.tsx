'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Re-fetches the data on the current page (every query currently on screen)
 * without reloading the window, so filters, scroll and open panels stay put.
 * The icon spins while any request is in flight.
 */
export function RefreshButton() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const isFetching = useIsFetching() > 0
  const [isRefreshing, setIsRefreshing] = useState(false)
  const spinning = isRefreshing || isFetching

  async function refresh() {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      router.refresh()
      await queryClient.refetchQueries({ type: 'active' })
      // Data on other pages is marked stale so it re-loads when you go there.
      await queryClient.invalidateQueries({ refetchType: 'none' })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={refresh}
      disabled={isRefreshing}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Refresh data"
      title="Refresh data"
    >
      <ArrowClockwiseIcon size={17} className={cn(spinning && 'animate-spin')} />
    </Button>
  )
}
