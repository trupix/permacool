import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const home = read("../app/page.jsx");
const header = read("../app/components/ResponsiveHeader.jsx");
const navigation = read("../app/insights/insights-data.js");
const styles = read("../app/home-design.css");

for (const route of ["/ethanol-chilling-systems", "/butane-recovery-system", "/perma-lab-process", "/ethanol-chiller-blast-60", "/ethanol-chiller-blast-150", "/ethanol-chiller-blast-150-30", "/ethanol-chiller-blast-240"]) {
  assert.ok(home.includes(`"${route}"`), `Missing product destination ${route}`);
  assert.ok(existsSync(new URL(`../app${route}/page.jsx`, import.meta.url)), `Missing route ${route}`);
}
assert.ok(navigation.includes('["Extraction Chillers", "/#extraction"]'));
assert.ok(navigation.includes('["Lab Process", "/perma-lab-process"]'));
assert.ok(header.includes('aria-expanded={extractionOpen}'));
assert.ok(header.includes('aria-expanded={mobileExtractionOpen}'));
assert.ok(header.includes('aria-controls="extraction-navigation"'));
assert.ok(header.includes('aria-controls="mobile-extraction-links"'));
assert.ok(home.includes('id="extraction"') && home.includes('id="lab-process"'));
assert.ok(home.includes("design reference") && home.includes("Final equipment may differ"));
assert.ok(!/data.?center|coming soon/i.test(home));
assert.ok(styles.includes("object-fit:contain"), "Equipment images must remain uncropped");
assert.ok(styles.includes("@media(max-width:760px)"));
for (const [, asset] of home.matchAll(/src="(\/images\/[^\"]+)"/g)) {
  assert.ok(existsSync(new URL(`../public${asset}`, import.meta.url)), `Missing homepage image ${asset}`);
}
console.log("Homepage families, product destinations, navigation controls, and reference-image checks passed.");
