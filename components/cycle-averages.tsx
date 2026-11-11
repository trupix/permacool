import { getSiteCycleAverages } from '@/server/repositories/cycle-averages';
import { CycleAveragesLive } from './cycle-averages-live';
export async function CycleAverages({ siteId, timezone }: { siteId: string; timezone: string }) {
  try {
    const rows = await getSiteCycleAverages(siteId);
    return <CycleAveragesLive key={siteId} siteId={siteId} timezone={timezone} initialRows={rows} />;
  } catch {
    return <CycleAveragesLive key={siteId} siteId={siteId} timezone={timezone} initialRows={[]} initialError />;
  }
}
