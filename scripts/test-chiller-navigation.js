import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chillerModels, chillerOverview, getChillerNavigation } from "../lib/chiller-navigation.js";
import { buildContactHref } from "../lib/contact.js";

assert.equal(chillerModels.length, 4);
assert.equal(new Set(chillerModels.map((model) => model.href)).size, 4);
const homepage = readFileSync(new URL("../app/page.jsx", import.meta.url), "utf8");
for (const model of chillerModels) {
  assert.ok(homepage.includes(`title: "${model.label}"`), `Homepage missing ${model.label}`);
  assert.ok(homepage.includes(`href: "${model.href}"`), `Homepage missing ${model.href}`);
}
assert.ok(!homepage.includes("Compare all three BLAST chillers"));
for (const model of chillerModels) {
  const context = getChillerNavigation(model.href);
  assert.equal(context.selectedHref, model.href);
  const href = new URL(buildContactHref(context.contact), "https://perma.cool");
  assert.equal(href.pathname, "/contact-us");
  assert.equal(href.searchParams.get("product"), model.label);
  assert.equal(href.searchParams.get("request_type"), "Product Pricing");
  assert.equal(href.searchParams.get("source"), model.href.slice(1));
}
for (const path of [chillerOverview, "/ethanol-chiller-comparison"]) {
  const context = getChillerNavigation(path);
  assert.ok(context);
  assert.equal(context.selectedHref, "");
  assert.equal(context.contact.product, undefined);
  assert.equal(context.contact.interest, "Ethanol Chillers");
}
for (const path of ["/", "/contact-us", "/dashboard", "/workflow", "/butane-recovery-system", null]) {
  assert.equal(getChillerNavigation(path), null);
}
console.log("Chiller model navigation and contextual pricing checks passed.");
