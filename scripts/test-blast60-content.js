import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename } from "node:path";

const baseline = execFileSync("git", ["show", "a98dc9ccf2f79062ca3f706228a1c1c624808217:app/Blast60Page.jsx"], { encoding: "utf8" });
const page = readFileSync("app/Blast60Page.jsx", "utf8");
assert.equal((page.match(/<ExpandableImage\b/g) || []).length, 5, "Four component images plus four standalone images must use the shared viewer");
assert.ok(!page.includes('target="_blank"'), "Expandable images must not navigate to raw-image tabs");
const viewer = readFileSync("app/components/ExpandableImage.jsx", "utf8");
assert.ok(viewer.includes("Back to page") && viewer.includes("showModal()") && viewer.includes("onClose="), "Viewer must provide a modal with a working return control");
assert.ok(page.includes('/images/generated/blast60-capacity-framed.png'), "Capacity comparison graphic must remain on the page");
assert.ok(existsSync("public/images/generated/blast60-capacity-framed.png"), "Capacity comparison asset must exist");
assert.ok(page.includes("chilling tank, 60 gallons; centrifuge, 30 gallons. 2:1 tank-to-centrifuge capacity."), "Keep capacity data accessible in image alt text");
const oldImages = new Set([...baseline.matchAll(/["'](\/images\/[^"']+\.(?:png|jpg|webp))["']/g)].map((match) => match[1]));
assert.equal(oldImages.size, 8, "Review the baseline asset inventory if it changes");
for (const path of oldImages) {
  assert.ok(page.includes(basename(path)), `Missing original image: ${path}`);
  assert.ok(existsSync(`public${path}`), `Missing asset file: ${path}`);
}
for (const phrase of [
  "Production Fit", "Built smart, cascade design", "Production-ready workflow", "Fast return on value",
  "Two smaller, common-sized refrigeration stages", "diagnosis, repair", "long-term maintenance",
  "more than 200 units", "roughly 40 gallons", "2 to 3 lb", "filtration and evaporation",
  "1.33 GPM", "HVAC condenser integration", "PLC/HMI", "compressor protection logic",
  "ROI / Replacement", "ownership cost", "<LearningCenterSection />"
]) assert.ok(page.includes(phrase), `Missing content coverage: ${phrase}`);
for (const href of ["/workflow", "/direct-refrigerant-vs-ln2", "/industrial-process-chiller-maintenance"]) {
  assert.ok(page.includes(`href="${href}"`), `Missing resource link: ${href}`);
}
const learning = readFileSync("app/components/LearningCenterSection.jsx", "utf8");
for (const slug of ["minus-40-celsius-fahrenheit", "direct-refrigerant-vs-ln2", "how-to-reduce-ln2-dependence"]) {
  assert.ok(learning.includes(slug));
}
console.log(`BLAST 60 content coverage passed: ${oldImages.size} original images, restored details, and resource links.`);
