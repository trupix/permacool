import { labAccess } from "@/server/lab-catalog";
import { photoBytes } from "@/server/lab-photos";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await labAccess();
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (!access)
    return new Response("Lab access required.", { status: 403, headers });
  try {
    const bytes = await photoBytes(access.organizationId, (await params).id);
    return bytes
      ? new Response(new Uint8Array(bytes), {
          headers: { ...headers, "Content-Type": "image/jpeg" },
        })
      : new Response("Photo not found.", { status: 404, headers });
  } catch {
    return new Response("Photo unavailable.", { status: 503, headers });
  }
}
