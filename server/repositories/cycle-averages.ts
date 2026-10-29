import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { shouldUseDatabase } from './shared';

// Only adjacent, fresh enabled samples establish observed operating time.
// Missing communication is never silently counted as system-on time.
export const getSiteCycleAverages = unstable_cache(async (siteId: string) => {
  if (!shouldUseDatabase()) return [];
  const points = await db.telemetryPoint.findMany({ where: { device: { siteId }, key: { in: ['ch1_system_on','ch2_system_on','ch3_system_on','ch4_system_on'] } }, select: { deviceId: true, key: true } });
  const windows: Array<{ deviceId: string; channel: string; start: Date; end: Date }> = [];
  await Promise.all(points.map(async point => {
    let used = 0, read = 0;
    let cursor: Date | undefined;
    let newer: { capturedAt: Date; value: number } | undefined;
    const own: typeof windows = [];
    while (used < 28800000 && read < 50000) {
      const samples = await db.telemetrySample.findMany({
        where: { deviceId: point.deviceId, key: point.key, capturedAt: {
          gte: new Date(Date.now()-30*86400000), ...(cursor ? { lt: cursor } : {})
        } }, orderBy: { capturedAt: 'desc' }, take: 2500, select: { capturedAt: true, value: true }
      });
      if (!samples.length) break;
      read += samples.length;
      for (const sample of samples) {
        if (newer) {
          const gap = newer.capturedAt.getTime()-sample.capturedAt.getTime();
          if (gap > 0 && gap <= 120000 && newer.value > 0 && sample.value > 0) {
            const amount = Math.min(gap, 28800000-used);
            const start = new Date(newer.capturedAt.getTime()-amount);
            const previous = own[own.length-1];
            if (previous && previous.start.getTime() === newer.capturedAt.getTime()) previous.start = start;
            else own.push({ deviceId: point.deviceId, channel: point.key.split('_')[0].toUpperCase(), start, end: newer.capturedAt });
            used += amount;
          }
        }
        newer = sample;
        if (used >= 28800000) break;
      }
      cursor = samples[samples.length-1].capturedAt;
      if (samples.length < 2500) break;
    }
    windows.push(...own.reverse());
  }));
  const earliest = new Date(windows.length ? Math.min(...windows.map(w => w.start.getTime())) : Date.now());
  const events = windows.length ? await db.equipmentEvent.findMany({ where: { siteId, occurredAt: { gte: earliest } },
    orderBy: { occurredAt: 'asc' }, select: { deviceId: true, channel: true, eventType: true, occurredAt: true } }) : [];
  const devices = await db.device.findMany({ where: { siteId }, select: { id: true, name: true } });
  return points.map(point => {
    const deviceId = point.deviceId, channel = point.key.split('_')[0].toUpperCase();
    const id = `${deviceId}|${channel}`;
    const own = windows.filter(w => `${w.deviceId}|${w.channel}` === id);
    const off: number[] = [], between: number[] = [];
    for (const window of own) {
      let reached: number | null = null, resumed = false;
      for (const e of events) {
        const t = e.occurredAt.getTime();
        if (e.deviceId !== deviceId || (e.channel !== channel && e.channel !== 'SYSTEM') || t < window.start.getTime() || t > window.end.getTime()) continue;
        if (['system_on','system_off','high_pressure_stop','high_pressure_cleared','compressor_stopped'].includes(e.eventType)) { reached = null; resumed = false; }
        if (e.channel !== channel) continue;
        if (e.eventType === 'reached_temperature') {
          if (reached !== null && resumed && t > reached) between.push((t-reached)/1000);
          reached = t; resumed = false;
        }
        if (e.eventType === 'compressor_started' && reached !== null && !resumed && t > reached) {
          off.push((t-reached)/1000); resumed = true;
        }
      }
    }
    const mean = (values: number[]) => values.length ? values.reduce((a,b) => a+b,0)/values.length : null;
    return { id, channel, deviceName: devices.find(d => d.id === deviceId)?.name ?? deviceId,
      hours: own.reduce((n,w) => n+(w.end.getTime()-w.start.getTime())/3600000,0),
      asOf: own.length ? own[own.length-1].end.toISOString() : null, off: mean(off), between: mean(between), offCount: off.length, betweenCount: between.length,
      offLow: off.length ? Math.min(...off) : null, offHigh: off.length ? Math.max(...off) : null,
      betweenLow: between.length ? Math.min(...between) : null, betweenHigh: between.length ? Math.max(...between) : null };
  });
}, ['system-on-cycle-averages-v3'], { revalidate: 1800 });

export type CycleAverageRows = Awaited<ReturnType<typeof getSiteCycleAverages>>;
