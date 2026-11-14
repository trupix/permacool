import { db } from '@/lib/db';
import { validateLibrarySnapshot, type LibrarySnapshot } from '@/lib/plc-library-contract';

export type LibraryState = { snapshot: LibrarySnapshot | null; receivedAt: string | null; lastAttemptAt: string | null; lastError: string | null; unavailable: boolean };
type Row = { snapshot: unknown; receivedAt: Date | null; lastAttemptAt: Date; lastError: string | null };

export async function getPlcLibrary(): Promise<LibraryState> {
  try {
    const rows = await db.$queryRaw<Row[]>`SELECT "snapshot", "receivedAt", "lastAttemptAt", "lastError" FROM "PlcLibrarySnapshot" WHERE id = 'controller-library' LIMIT 1`;
    const row = rows[0];
    return { snapshot: row?.snapshot ? validateLibrarySnapshot(row.snapshot) : null, receivedAt: row?.receivedAt?.toISOString() ?? null, lastAttemptAt: row?.lastAttemptAt?.toISOString() ?? null, lastError: row?.lastError ?? null, unavailable: false };
  } catch {
    return { snapshot: null, receivedAt: null, lastAttemptAt: null, lastError: 'Library storage is unavailable. Current records could not be verified.', unavailable: true };
  }
}

export async function savePlcLibrary(snapshot: LibrarySnapshot | null, runNumber: number, runAttempt: number, failure: boolean) {
  const payload = snapshot ? JSON.stringify(snapshot) : null;
  // Atomic monotonic replacement: late/duplicate runs cannot roll the page back.
  const count = await db.$executeRaw`
    INSERT INTO "PlcLibrarySnapshot" (id, snapshot, "receivedAt", "lastAttemptAt", "lastError", "runNumber", "runAttempt")
    VALUES ('controller-library', ${payload}::jsonb, CASE WHEN ${failure} THEN NULL ELSE NOW() END, NOW(),
      CASE WHEN ${failure} THEN 'GitHub publication failed; showing the last successful snapshot.' ELSE NULL END, ${runNumber}::bigint, ${runAttempt})
    ON CONFLICT (id) DO UPDATE SET
      snapshot = CASE WHEN ${failure} THEN "PlcLibrarySnapshot".snapshot ELSE EXCLUDED.snapshot END,
      "receivedAt" = CASE WHEN ${failure} THEN "PlcLibrarySnapshot"."receivedAt" ELSE EXCLUDED."receivedAt" END,
      "lastAttemptAt" = EXCLUDED."lastAttemptAt", "lastError" = EXCLUDED."lastError",
      "runNumber" = EXCLUDED."runNumber", "runAttempt" = EXCLUDED."runAttempt"
    WHERE (EXCLUDED."runNumber", EXCLUDED."runAttempt") > ("PlcLibrarySnapshot"."runNumber", "PlcLibrarySnapshot"."runAttempt")`;
  return count > 0;
}
