import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const home = read("../app/page.jsx");
const lab = read("../app/perma-lab-process/page.jsx");
const plain = (source) => source.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

for (const copy of [
  "Extraction chillers and lab process cooling — split systems sized to the job.",
  "Two product lines. Two jobs.",
  "High-capacity process cooling. Condenser heat stays out of the lab.",
  "Water / glycol process loops",
  "Remote outdoor condenser",
  "Mid-temp standard · low-temp to −40 °C optional*",
  "Send four numbers. We’ll map a layout.",
  "What fluid and what setpoint?",
  "What load and what flow?",
  "Where does the condenser go?",
  "*Temperature capability depends on configuration, fluid, and process load."
]) assert.ok(plain(home).includes(copy), `Missing homepage copy: ${copy}`);

for (const copy of [
  "Process cooling in the lab. Heat rejection outside.",
  "PRODUCT LINE · NOT BLAST™",
  "LAB & PROCESS COOLING · WATER / GLYCOL",
  "Lab-side process unit. Remote condenser.",
  "COOL THE LOOP. DON’T HEAT THE LAB.",
  "Skid and plate heat-exchanger platforms — configured for lab/process duty.",
  "Pick the duty from the setpoint — not the lowest number on the brochure.",
  "Mid-temperature (typical lab/process)",
  "What we need to size the system.",
  "Four inputs. No RFQ novel required.",
  "Lab Process ≠ BLAST™.",
  "Sized for high-capacity lab and process loads — large closed-loop systems, multi-tool or facility loops, and production-floor cooling — not small bench recirculators.",
  "High-capacity closed-loop process cooling",
  "Multi-tool and facility-scale lab loops",
  "Production and pilot-process heat loads",
  "Sites that need condenser heat and noise out of the lab",
  "Not a small bench recirculator. Not an ethanol BLAST™ skid with a new label.",
  "Send setpoint, load, fluid/flow, and condenser location."
]) assert.ok(plain(lab).includes(copy), `Missing Lab Process copy: ${copy}`);

for (const old of ["Large cooling capacity.", "Small lab footprint.", "Dedicated cooling systems.", "Let’s define", "Matched to your", "A separate purpose.", "Bring us the process."]) {
  assert.ok(!plain(home + lab).includes(old), `Old filler remains: ${old}`);
}
assert.ok(!/\d+\s*(?:kW|tons|GPM)\b/.test(home + lab), "Do not invent numerical capacity/flow ratings");
assert.ok(!lab.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].includes("−40"), "Low-temp must not become the hero claim");
assert.ok(lab.includes('interest: "Lab Process Chillers", product: "PERMA Lab Process", requestType: "System Fit Review"'));
assert.ok(lab.includes('href="/ethanol-chilling-systems"'));
assert.ok(lab.includes('id="lab-built-for-title"'));
console.log("Lab copy brief, product separation, requested application block and no-invented-ratings checks passed.");
