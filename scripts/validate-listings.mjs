// Validates every listings/*.json against schema/manifest.schema.json, then runs the checks a
// JSON Schema alone can't express: the filename matches the manifest's own "id", every requested
// scope is a member of schema/known-scopes.json, and "repository" actually resolves (not a 404,
// not a private repo). Deliberately plain Node (fetch is built in since Node 18) plus ajv via
// npx for schema validation - no package.json/node_modules to maintain for a repo this small.

import { readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const listingsDir = path.join(root, "listings");
const knownScopes = new Set(JSON.parse(readFileSync(path.join(root, "schema/known-scopes.json"), "utf8")).scopes);

const files = readdirSync(listingsDir).filter((f) => f.endsWith(".json"));
if (files.length === 0) {
  console.log("No listings yet - nothing to validate.");
  process.exit(0);
}

// Schema validation via ajv-cli (installed on demand, no local dependency to maintain).
try {
  execSync(
    `npx --yes ajv-cli validate -s schema/manifest.schema.json -d "listings/*.json" --spec=draft2020`,
    { cwd: root, stdio: "inherit" },
  );
} catch {
  console.error("Schema validation failed - see ajv output above.");
  process.exit(1);
}

let failed = false;

for (const file of files) {
  const manifest = JSON.parse(readFileSync(path.join(listingsDir, file), "utf8"));
  const expectedId = path.basename(file, ".json");

  if (manifest.id !== expectedId) {
    console.error(`${file}: "id" (${manifest.id}) must match the filename (${expectedId}).`);
    failed = true;
  }

  const unknownScopes = manifest.requestedScopes.filter((s) => !knownScopes.has(s));
  if (unknownScopes.length > 0) {
    console.error(`${file}: requestedScopes contains unknown scope(s): ${unknownScopes.join(", ")}. See schema/known-scopes.json for the current list.`);
    failed = true;
  }

  try {
    const response = await fetch(manifest.repository, { method: "HEAD", redirect: "follow" });
    if (!response.ok) {
      console.error(`${file}: repository URL ${manifest.repository} returned ${response.status} - must resolve to a public repository.`);
      failed = true;
    }
  } catch (err) {
    console.error(`${file}: repository URL ${manifest.repository} could not be reached: ${err.message}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log(`Validated ${files.length} listing(s) - all good.`);
