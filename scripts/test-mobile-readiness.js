import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const css = read("../app/globals.css");
const header = read("../app/components/ResponsiveHeader.jsx");
const chart = read("../app/ethanol-chiller-comparison/page.jsx");
const viewer = read("../app/components/ExpandableImage.jsx");
const viewerCss = read("../app/components/expandable-image.css");
const navCss = read("../app/components/chiller-model-nav.css");

// Structural safeguards supplement the actual viewport/interaction audit.
for (const height of [66, 74]) {
  assert.ok(css.includes(`height: calc(100dvh - ${height}px)`), "Menu must track mobile browser height");
}
assert.ok(css.includes("overscroll-behavior-y: contain"));
const mobileControls = css.slice(css.indexOf("/* Keep public-site controls readable"));
for (const selector of [".contact-form input", ".contact-form select", ".contact-form textarea", ".learning-select select", ".sign-in-panel .auth-form input"]) {
  assert.ok(mobileControls.includes(selector), `Missing phone control treatment: ${selector}`);
}
assert.ok(mobileControls.includes("font-size: 16px"));
assert.ok(mobileControls.includes("min-height: 44px"));
assert.ok(chart.includes('role="region" aria-label="BLAST model comparison chart" tabIndex={0}'));
assert.ok(chart.includes("Swipe across the chart to compare all four models."));
assert.ok(css.includes("overscroll-behavior-x: contain"));
assert.ok(header.includes('aria-modal="true"'));
assert.ok(header.includes('inert={!extractionOpen}'), "Closed dropdown must use a boolean inert attribute");
assert.ok(header.includes('event.key === "Escape"'));
assert.ok(header.includes('document.body.style.overflow = previousOverflow'));
assert.ok(header.includes('element.removeAttribute("inert")'));
assert.ok(viewer.includes("Back to page") && viewer.includes("showModal()"));
assert.ok(viewer.includes("focus({ preventScroll: true })"));
assert.ok(viewerCss.includes("object-fit: contain"));
assert.ok(navCss.includes("font: 600 16px"));
console.log("Mobile menu, form sizing, touch targets, model navigation and image/chart accessibility safeguards passed.");
