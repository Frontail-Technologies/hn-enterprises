import type { Metadata } from 'next'
import { mastersService } from '@/features/masters/services/masters.service'
import { MasterSettingsGrid } from '@/features/masters/components/MasterSettingsGrid'
import { MasterDataList } from '@/features/masters/components/MasterDataList'

export const metadata: Metadata = { title: 'Masters — HN Enterprises' }

export default async function MastersPage() {
  const configs = mastersService.getConfigs()

  const counts: Record<string, number> = {}
  const lastUpdated: Record<string, string> = {}

  await Promise.all(
    configs.map(async (cfg) => {
      const records = await mastersService.getRecords(cfg.id)
      counts[cfg.id] = records.length
      lastUpdated[cfg.id] = records[0]?.updatedAt ?? '—'
    })
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Settings / Masters</h1>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Master Settings</h2>
          <MasterSettingsGrid configs={configs} counts={counts} />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Master Data List</h2>
          <MasterDataList configs={configs} counts={counts} lastUpdated={lastUpdated} />
        </div>
      </div>
    </div>
  )
}
