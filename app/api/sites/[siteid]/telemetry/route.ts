import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { hasDatabaseUrl, isSiteTelemetryApiEnabled } from '@/lib/env';
import { getDeviceTelemetry, getDevicesBySite } from '@/server/repositories/devices';
import { getSite } from '@/server/repositories/sites';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteid: string }> }
) {
  if (!isSiteTelemetryApiEnabled()) {
    return NextResponse.json(
      {
        error:
          'Site telemetry API is disabled by the deployment environment.'
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'private, no-store'
        }
      }
    );
  }

  const { siteid } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const site = await getSite(siteid);

  if (!site) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  if (!user.organizationIds.includes(site.organizationId)) {
    return NextResponse.json({ error: 'Site access denied.' }, { status: 403 });
  }

  const devices = await getDevicesBySite(site.id);
  const pointsByDevice = await Promise.all(
    devices.map(async (device) => ({
      device,
      points: await getDeviceTelemetry(device.id)
    }))
  );

  const points = pointsByDevice.flatMap(({ device, points: devicePoints }) =>
    devicePoints.map((point) => ({
      ...point,
      deviceName: device.name
    }))
  );

  return NextResponse.json(
    {
      points,
      source: hasDatabaseUrl() ? 'database' : 'mock-fallback',
      fetchedAt: new Date().toISOString()
    },
    {
      headers: {
        'Cache-Control': 'private, no-store'
      }
    }
  );
}
