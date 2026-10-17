import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { localLabPreview } from "@/server/lab-catalog";
import { validPhotoId, type LabPhoto } from "@/lib/lab-nameplate";
const directory = () => path.join(process.cwd(), ".lab-private", "photos");
export async function listPhotos(
  organizationId: string,
  assetId: string,
): Promise<LabPhoto[]> {
  if (localLabPreview()) {
    let files: string[];
    try {
      files = await readdir(directory());
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
    const records = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(
          async (file) =>
            JSON.parse(
              await readFile(path.join(directory(), file), "utf8"),
            ) as LabPhoto,
        ),
    );
    return records
      .filter((record) => record.assetId === assetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const records = await db.labPhoto.findMany({
    where: { organizationId, assetId },
    select: {
      id: true,
      assetId: true,
      kind: true,
      caption: true,
      createdAt: true,
      author: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return records.map((record) => ({
    ...record,
    kind: record.kind as LabPhoto["kind"],
    createdAt: record.createdAt.toISOString(),
  }));
}
export async function storePhoto(
  organizationId: string,
  details: Omit<LabPhoto, "id" | "createdAt">,
  bytes: Buffer,
): Promise<LabPhoto> {
  const photo: LabPhoto = {
    ...details,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  if (localLabPreview()) {
    await mkdir(directory(), { recursive: true });
    await writeFile(path.join(directory(), `${photo.id}.jpg`), bytes, {
      flag: "wx",
    });
    await writeFile(
      path.join(directory(), `${photo.id}.json`),
      JSON.stringify(photo),
      { flag: "wx" },
    );
  } else
    await db.labPhoto.create({
      data: { ...photo, organizationId, bytes: new Uint8Array(bytes) },
    });
  return photo;
}
export async function photoBytes(organizationId: string, id: string) {
  if (!validPhotoId(id)) return null;
  if (localLabPreview()) {
    try {
      return await readFile(path.join(directory(), `${id}.jpg`));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
  const photo = await db.labPhoto.findFirst({
    where: { id, organizationId },
    select: { bytes: true },
  });
  return photo ? Buffer.from(photo.bytes) : null;
}
