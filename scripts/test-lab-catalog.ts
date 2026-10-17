import assert from "node:assert/strict";
// @ts-ignore Node's native TypeScript runner requires the source extension.
import {
  validCatalog,
  mayAccessLab,
  safeSource,
  emptyCatalog,
// @ts-ignore Node's native TypeScript runner requires the extension.
} from "../lib/lab-catalog.ts";
assert.equal(validCatalog(emptyCatalog), true);
assert.equal(validCatalog({ ...emptyCatalog, assets: [null] }), false);
assert.equal(
  validCatalog({ ...emptyCatalog, unmatched: [{ id: "x" }] }),
  false,
);
assert.equal(safeSource("javascript:alert(1)"), undefined);
assert.equal(
  safeSource("https://docs.google.com/"),
  "https://docs.google.com/",
);
const viewer = {
  status: "approved",
  platformRole: "customer",
  organizationIds: ["lab-a"],
  organizationRoles: { "lab-a": "viewer" },
};
assert.equal(mayAccessLab(viewer, "lab-a"), true);
assert.equal(mayAccessLab(viewer, "lab-a", true), false);
assert.equal(mayAccessLab(viewer, "lab-b"), false);
assert.equal(
  mayAccessLab(
    { ...viewer, organizationRoles: { "lab-a": "operator" } },
    "lab-a",
    true,
  ),
  true,
);
assert.equal(mayAccessLab({ ...viewer, status: "suspended" }, "lab-a"), false);
assert.equal(
  mayAccessLab({ ...viewer, platformRole: "staff_admin" }, ""),
  false,
);
console.log(
  "Lab validation, source links and organization access checks passed.",
);
