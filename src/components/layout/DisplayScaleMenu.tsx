'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { TextAaIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type DesktopBridge = {
  getDisplayScale?: () => Promise<number>
  setDisplayScale?: (scale: number) => Promise<number>
  onDisplayScaleChange?: (callback: (scale: number) => void) => () => void
}

declare global {
  interface Window {
    hnDesktop?: DesktopBridge & { isDesktop: boolean; platform: string }
  }
}

const SCALES = [
  { value: 0.9, label: 'Compact' },
  { value: 1, label: 'Default' },
  { value: 1.1, label: 'Large' },
  { value: 1.25, label: 'Larger' },
  { value: 1.4, label: 'Largest' },
] as const

const percent = (scale: number) => `${Math.round(scale * 100)}%`

// The desktop bridge never changes after load; null on the server and in browsers.
const noopSubscribe = () => () => {}
const readBridge = (): DesktopBridge | null =>
  window.hnDesktop?.setDisplayScale && window.hnDesktop.getDisplayScale ? window.hnDesktop : null

/**
 * Display size for the desktop app: scales the whole UI evenly (Electron page
 * zoom), remembered between launches. Ctrl + / Ctrl − / Ctrl 0 do the same.
 * Hidden in a normal browser, which has its own zoom (Ctrl + / Ctrl −).
 */
export function DisplayScaleMenu() {
  const bridge = useSyncExternalStore(noopSubscribe, readBridge, () => null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!bridge) return
    bridge.getDisplayScale!().then(setScale).catch(() => {})
    // Keep the menu in sync when the keyboard shortcuts change the size.
    return bridge.onDisplayScaleChange?.(setScale)
  }, [bridge])

  if (!bridge) return null

  async function choose(value: number) {
    setScale(value)
    try {
      setScale(await bridge!.setDisplayScale!(value))
    } catch {
      // Main process unavailable: leave the current size as it is.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="compact"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Display size, ${percent(scale)}`}
            title="Display size (Ctrl + / Ctrl −)"
          />
        }
      >
        <TextAaIcon size={16} />
        <span className="tabular-nums">{percent(scale)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Display size</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={String(scale)} onValueChange={(value) => choose(Number(value))}>
            {SCALES.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={String(option.value)}>
                <span className="flex-1">{option.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{percent(option.value)}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
