// The pure, offline checks of scripts/validate-listings.mjs, split out so they can be unit- and
// property-tested without touching the filesystem, the network or ajv.

import path from "node:path";

/** The id a listing file must declare: its filename without the .json extension. */
export function expectedId(file) {
  return path.basename(file, ".json");
}

/** Requested scopes that are not in the known set, in their original order. */
export function unknownScopes(requestedScopes, knownScopes) {
  const known = knownScopes instanceof Set ? knownScopes : new Set(knownScopes);
  return requestedScopes.filter((scope) => !known.has(scope));
}

/** True when the listing is installed by hand (explicit "install": "manual"); absent means oauth. */
export function isManualInstall(manifest) {
  return manifest.install === "manual";
}

/** Problems with the install-mode fields (mirrors the schema's if/then so the rule is testable offline). */
export function installProblems(file, manifest) {
  const problems = [];
  const has = (key) => manifest[key] !== undefined;
  if (isManualInstall(manifest)) {
    if (!has("setupUrl")) problems.push(`${file}: a manual listing requires "setupUrl".`);
    if (has("redirectUriPattern")) problems.push(`${file}: a manual listing must not declare "redirectUriPattern".`);
  } else {
    if (!has("redirectUriPattern")) problems.push(`${file}: an oauth listing requires "redirectUriPattern".`);
    if (has("setupUrl")) problems.push(`${file}: "setupUrl" is only allowed with "install": "manual".`);
  }
  return problems;
}

/** Human-readable problems found by the offline checks; an empty array means the listing passes. */
export function listingProblems(file, manifest, knownScopes) {
  const problems = [];
  const id = expectedId(file);
  if (manifest.id !== id) {
    problems.push(`${file}: "id" (${manifest.id}) must match the filename (${id}).`);
  }
  problems.push(...installProblems(file, manifest));
  const unknown = unknownScopes(manifest.requestedScopes, knownScopes);
  if (unknown.length > 0) {
    problems.push(
      `${file}: requestedScopes contains unknown scope(s): ${unknown.join(", ")}. See schema/known-scopes.json for the current list.`,
    );
  }
  return problems;
}
