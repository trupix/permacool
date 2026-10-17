export const assetStates = [
  "Unknown",
  "Operating",
  "Needs attention",
  "Awaiting parts",
  "Out of service",
  "Retired",
] as const;
export const workStates = ["Open", "In progress", "Completed"] as const;
export const partStates = [
  "To identify",
  "Quoted",
  "Ordered",
  "Received",
  "Installed",
] as const;
export type LabItem = {
  id: string;
  title: string;
  status: string;
  date: string;
  detail: string;
  reference: string;
  author: string;
};
export type LabAsset = {
  id: string;
  name: string;
  kind: "Freezer" | "Refrigerator" | "Combination";
  location: string;
  brand: string;
  model: string;
  serial: string;
  electrical: string;
  refrigerant: string;
  charge: string;
  pressure: string;
  notes: string;
  source: string;
  sourceRow: string;
  status: (typeof assetStates)[number];
  statusDate: string;
  tasks: LabItem[];
  parts: LabItem[];
  history: LabItem[];
};
export type LabCatalog = {
  title: string;
  assets: LabAsset[];
  unmatched: LabItem[];
};
export type CatalogSnapshot = { revision: number; catalog: LabCatalog };
export const emptyCatalog: LabCatalog = {
  title: "Lab equipment",
  assets: [],
  unmatched: [],
};

function boundedText(value: unknown, max = 8000): value is string {
  return typeof value === "string" && value.length <= max;
}
function items(
  value: unknown,
  allowed?: readonly string[],
): value is LabItem[] {
  return (
    Array.isArray(value) &&
    value.length <= 1000 &&
    value.every(
      (item) =>
        item &&
        [
          "id",
          "title",
          "status",
          "date",
          "detail",
          "reference",
          "author",
        ].every((key) => boundedText(item[key])) &&
        item.id &&
        item.title.trim() &&
        (!allowed || allowed.includes(item.status)),
    ) &&
    new Set(value.map((item) => item.id)).size === value.length
  );
}
export function validCatalog(value: unknown): value is LabCatalog {
  if (!value || typeof value !== "object") return false;
  const catalog = value as LabCatalog;
  return (
    boundedText(catalog.title, 150) &&
    Array.isArray(catalog.assets) &&
    catalog.assets.length <= 1000 &&
    new Set(catalog.assets.map((asset) => asset?.id)).size ===
      catalog.assets.length &&
    items(catalog.unmatched) &&
    catalog.assets.every(
      (asset) =>
        asset &&
        [
          "id",
          "name",
          "location",
          "brand",
          "model",
          "serial",
          "electrical",
          "refrigerant",
          "charge",
          "pressure",
          "notes",
          "source",
          "sourceRow",
          "statusDate",
        ].every((key) => boundedText(asset[key as keyof LabAsset])) &&
        asset.id &&
        asset.name.trim() &&
        ["Freezer", "Refrigerator", "Combination"].includes(asset.kind) &&
        assetStates.includes(asset.status) &&
        items(asset.tasks, workStates) &&
        items(asset.parts, partStates) &&
        items(asset.history),
    )
  );
}
export function safeSource(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function mayAccessLab(
  user: {
    status?: string;
    platformRole: string;
    organizationIds: string[];
    organizationRoles?: Record<string, string>;
  },
  organizationId: string,
  write = false,
) {
  if (!organizationId || user.status !== "approved") return false;
  if (["staff_admin", "staff_support"].includes(user.platformRole)) return true;
  return (
    user.organizationIds.includes(organizationId) &&
    (!write ||
      ["owner", "operator"].includes(
        user.organizationRoles?.[organizationId] ?? "",
      ))
  );
}
