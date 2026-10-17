import { NextResponse } from "next/server";
import sharp from "sharp";
import { labAccess, readCatalog } from "@/server/lab-catalog";
import { listPhotos, storePhoto } from "@/server/lab-photos";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const access = await labAccess();
  if (!access)
    return NextResponse.json(
      { error: "Lab access required." },
      { status: 403, headers },
    );
  const assetId = new URL(request.url).searchParams.get("assetId") ?? "";
  try {
    return NextResponse.json(
      { photos: await listPhotos(access.organizationId, assetId) },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Photos are unavailable. Check the lab database setup." },
      { status: 503, headers },
    );
  }
}
export async function POST(request: Request) {
  try {
    if (
      new URL(request.headers.get("origin") ?? "").host !==
      request.headers.get("host")
    )
      throw Error();
  } catch {
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403, headers },
    );
  }
  const access = await labAccess(true);
  if (!access)
    return NextResponse.json(
      { error: "Lab editing access required." },
      { status: 403, headers },
    );
  if (Number(request.headers.get("content-length")) > 4_000_000)
    return NextResponse.json(
      { error: "Choose a photo under 3 MB." },
      { status: 413, headers },
    );
  try {
    const data = await request.formData();
    const file = data.get("file");
    const assetId = String(data.get("assetId") ?? "");
    const kind = String(data.get("kind") ?? "");
    const caption = String(data.get("caption") ?? "").slice(0, 300);
    if (
      !(file instanceof File) ||
      file.size > 3_000_000 ||
      file.size === 0 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !["nameplate", "additional"].includes(kind)
    )
      return NextResponse.json(
        { error: "Choose a JPG, PNG or WebP photo under 3 MB." },
        { status: 400, headers },
      );
    const snapshot = await readCatalog(access.organizationId);
    if (!snapshot.catalog.assets.some((asset) => asset.id === assetId))
      return NextResponse.json(
        { error: "Equipment not found." },
        { status: 404, headers },
      );
    const bytes = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 30_000_000,
    })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer();
    const photo = await storePhoto(
      access.organizationId,
      {
        assetId,
        kind: kind as "nameplate" | "additional",
        caption,
        author: access.author,
      },
      bytes,
    );
    return NextResponse.json({ photo }, { status: 201, headers });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not save the photo. Check the image format and database setup, then try again.",
      },
      { status: 400, headers },
    );
  }
}
