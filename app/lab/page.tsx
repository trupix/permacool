import { LabPortal } from "@/components/lab-portal";
import { labAccess, localLabPreview, readCatalog } from "@/server/lab-catalog";
export const dynamic = "force-dynamic";
export default async function LabPage() {
  const access = await labAccess();
  if (!access)
    return (
      <main className="lab-locked">
        <p>PERMA COOL / LAB PORTAL</p>
        <h1>Your lab. One equipment record.</h1>
        <p>Sign in with an approved lab account to view the catalog.</p>
        <a href="/sign-in?next=/lab">Sign in</a>
        <p>
          If you are already signed in, ask your administrator to enable lab
          access.
        </p>
      </main>
    );
  try {
    const initial = await readCatalog(access.organizationId);
    return (
      <LabPortal
        initial={initial}
        canEdit={access.canEdit}
        author={access.author}
        preview={localLabPreview()}
      />
    );
  } catch {
    return (
      <main className="lab-locked">
        <h1>Catalog unavailable</h1>
        <p>
          The lab database needs to be connected or migrated. No equipment
          records have been changed.
        </p>
      </main>
    );
  }
}
