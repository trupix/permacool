import { NextResponse } from "next/server";
import { labAccess, readCatalog, saveCatalog } from "@/server/lab-catalog";
import { validCatalog } from "@/lib/lab-catalog";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function GET() {
  const access = await labAccess();
  if (!access)
    return NextResponse.json(
      { error: "Lab access required." },
      { status: 403, headers },
    );
  try {
    return NextResponse.json(await readCatalog(access.organizationId), {
      headers,
    });
  } catch {
    return NextResponse.json(
      { error: "Catalog unavailable. Check the lab database setup." },
      { status: 503, headers },
    );
  }
}
export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    const supplied = new URL(origin ?? "");
    sameOrigin =
      ["https:", "http:"].includes(supplied.protocol) &&
      supplied.host === request.headers.get("host");
  } catch {
    /* Missing or malformed origin is rejected. */
  }
  if (!sameOrigin)
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403, headers },
    );
  const access = await labAccess(true);
  if (!access)
    return NextResponse.json(
      { error: "Lab editing access required." },
      { status: 403, headers },
    );
  try {
    const raw = await request.text();
    if (raw.length > 2_000_000)
      return NextResponse.json(
        { error: "Catalog too large." },
        { status: 413, headers },
      );
    const { revision, catalog } = JSON.parse(raw);
    if (
      !Number.isSafeInteger(revision) ||
      revision < 0 ||
      !validCatalog(catalog)
    )
      return NextResponse.json(
        { error: "Invalid catalog data." },
        { status: 400, headers },
      );
    const saved = await saveCatalog(
      access.organizationId,
      revision,
      catalog,
      access.author,
    );
    if (!saved)
      return NextResponse.json(
        {
          error:
            "Someone else updated this catalog. Reload before saving your changes.",
        },
        { status: 409, headers },
      );
    return NextResponse.json({ revision: revision + 1 }, { headers });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not save. Your changes are still in this form; please try again.",
      },
      { status: 503, headers },
    );
  }
}
