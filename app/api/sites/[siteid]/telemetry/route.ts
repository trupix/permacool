import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deviceWhere, siteWhere } from "@/lib/access";
import { hasDatabaseUrl, isSiteTelemetryApiEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ siteid: string }> }) {
  if (!isSiteTelemetryApiEnabled()) {
    return NextResponse.json(
      { error: "Site telemetry API is disabled by the deployment environment." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteid } = await params;
  const site = await db.site.findFirst({ where: { AND: [{ id: siteid }, siteWhere(user)] }, select: { id: true } });
  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const history = request.nextUrl.searchParams.get("history") === "1";
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("pageSize")) || 10));
  const devices = await db.device.findMany({
    where: { AND: [{ siteId: siteid }, deviceWhere(user)] },
    select: { id: true, name: true }
  });
  const deviceNames = new Map(devices.map((device) => [device.id, device.name]));
  const deviceIds = devices.map((device) => device.id);

  if (history) {
    const where = { deviceId: { in: deviceIds } };
    const [samples, total] = await Promise.all([
      db.telemetrySample.findMany({
        where,
        orderBy: { capturedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.telemetrySample.count({ where })
    ]);

    return NextResponse.json({
      page,
      pageSize,
      total,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      samples: samples.map((sample) => ({ ...sample, deviceName: deviceNames.get(sample.deviceId) ?? "Unknown device" })),
      source: hasDatabaseUrl() ? "database" : "mock-fallback",
      fetchedAt: new Date().toISOString()
    }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const points = await db.telemetryPoint.findMany({
    where: { deviceId: { in: deviceIds } },
    orderBy: { key: "asc" }
  });

  return NextResponse.json({
    points: points.map((point) => ({ ...point, deviceName: deviceNames.get(point.deviceId) ?? "Unknown device" })),
    source: hasDatabaseUrl() ? "database" : "mock-fallback",
    fetchedAt: new Date().toISOString()
  }, { headers: { "Cache-Control": "private, no-store" } });
}
