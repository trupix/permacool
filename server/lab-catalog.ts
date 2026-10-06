import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabaseUrl, isSupabaseAuthEnabled } from "@/lib/env";
import {
  emptyCatalog,
  mayAccessLab,
  validCatalog,
  type CatalogSnapshot,
  type LabCatalog,
} from "@/lib/lab-catalog";
import type { Prisma } from "@prisma/client";

export const localLabPreview = () =>
  process.env.NODE_ENV === "development" &&
  process.env.LAB_LOCAL_PREVIEW === "1";
export async function labAccess(write = false) {
  if (localLabPreview())
    return {
      organizationId: "local-preview",
      author: "Local preview",
      canEdit: true,
    };
  if (!isSupabaseAuthEnabled() || !hasDatabaseUrl()) return null;
  const organizationId = process.env.LAB_ORGANIZATION_ID ?? "";
  const user = await getCurrentUser();
  if (!user || !mayAccessLab(user, organizationId, write)) return null;
  return {
    organizationId,
    author: user.name,
    canEdit: mayAccessLab(user, organizationId, true),
  };
}
const localFile = () =>
  path.join(process.cwd(), ".lab-private", "catalog.json");
export async function readCatalog(
  organizationId: string,
): Promise<CatalogSnapshot> {
  if (localLabPreview()) {
    try {
      const snapshot = JSON.parse(await readFile(localFile(), "utf8"));
      if (
        !validCatalog(snapshot.catalog) ||
        !Number.isInteger(snapshot.revision)
      )
        throw new Error("Invalid local catalog");
      return snapshot;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return { revision: 0, catalog: emptyCatalog };
    }
  }
  const row = await db.labCatalog.findUnique({ where: { organizationId } });
  if (!row) return { revision: 0, catalog: emptyCatalog };
  if (!validCatalog(row.catalog)) throw new Error("Invalid saved catalog");
  return { revision: row.revision, catalog: row.catalog };
}
let localQueue = Promise.resolve();
export async function saveCatalog(
  organizationId: string,
  revision: number,
  catalog: LabCatalog,
  author: string,
): Promise<boolean> {
  if (localLabPreview()) {
    let saved = false;
    const work = localQueue.then(async () => {
      const current = await readCatalog(organizationId);
      if (current.revision !== revision) return;
      await mkdir(path.dirname(localFile()), { recursive: true });
      const temporary = `${localFile()}.${randomUUID()}.tmp`;
      await writeFile(
        temporary,
        JSON.stringify({ revision: revision + 1, catalog }, null, 2),
      );
      await rename(temporary, localFile());
      saved = true;
    });
    localQueue = work.catch(() => {});
    await work;
    return saved;
  }
  if (revision === 0) {
    try {
      await db.labCatalog.create({
        data: {
          organizationId,
          catalog: catalog as unknown as Prisma.InputJsonValue,
          revision: 1,
          updatedBy: author,
        },
      });
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") return false;
      throw error;
    }
  }
  const result = await db.labCatalog.updateMany({
    where: { organizationId, revision },
    data: {
      catalog: catalog as unknown as Prisma.InputJsonValue,
      revision: { increment: 1 },
      updatedBy: author,
    },
  });
  return result.count === 1;
}
