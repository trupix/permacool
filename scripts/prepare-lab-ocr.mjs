import { createRequire } from "node:module";
import { mkdir, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
const require = createRequire(import.meta.url);
const target = path.resolve("public/lab-ocr");
await mkdir(target, { recursive: true });
await copyFile(
  require.resolve("tesseract.js/dist/worker.min.js"),
  path.join(target, "worker.min.js"),
);
const core = path.dirname(require.resolve("tesseract.js-core/package.json"));
for (const name of await readdir(core))
  if (name.endsWith(".wasm") || name.endsWith(".wasm.js"))
    await copyFile(path.join(core, name), path.join(target, name));
const { langPath } = require("@tesseract.js-data/eng");
await copyFile(
  path.join(langPath, "eng.traineddata.gz"),
  path.join(target, "eng.traineddata.gz"),
);
console.log("Prepared same-origin nameplate reader assets.");
