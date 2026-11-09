import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import fc from "fast-check";
import { expectedId, listingProblems, unknownScopes } from "../scripts/listing-checks.mjs";

const root = path.resolve(import.meta.dirname, "..");
const known = JSON.parse(readFileSync(path.join(root, "schema/known-scopes.json"), "utf8")).scopes;
const scope = fc.oneof(fc.constantFrom(...known), fc.string());
const listingId = fc.stringMatching(/^[a-z][a-z0-9-]{0,30}$/);

describe("expectedId (property-based)", () => {
  it("is the filename without .json, whatever directory prefix the path has", () => {
    fc.assert(
      fc.property(listingId, fc.constantFrom("", "listings/", "./listings/"), (id, dir) => {
        assert.equal(expectedId(`${dir}${id}.json`), id);
      }),
    );
  });
});

describe("unknownScopes (property-based)", () => {
  it("returns an order-preserving subsequence of the request that contains no known scope", () => {
    fc.assert(
      fc.property(fc.array(scope, { maxLength: 30 }), (requested) => {
        const unknown = unknownScopes(requested, known);
        assert.ok(unknown.every((s) => !known.includes(s)));
        assert.deepEqual(unknown, requested.filter((s) => !known.includes(s)));
      }),
    );
  });

  it("accepts any selection of known scopes, in any order, with repeats", () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...known), { maxLength: 40 }), (requested) => {
        assert.deepEqual(unknownScopes(requested, known), []);
      }),
    );
  });

  it("known and unknown scopes partition the request, and a Set gives the same answer as an array", () => {
    fc.assert(
      fc.property(fc.array(scope, { maxLength: 30 }), (requested) => {
        const unknown = unknownScopes(requested, known);
        const recognised = requested.filter((s) => known.includes(s));
        assert.equal(unknown.length + recognised.length, requested.length);
        assert.deepEqual(unknownScopes(requested, new Set(known)), unknown);
      }),
    );
  });
});

describe("listingProblems (property-based)", () => {
  it("passes a listing whose id matches its filename and whose scopes are all known", () => {
    fc.assert(
      fc.property(listingId, fc.array(fc.constantFrom(...known), { maxLength: 20 }), (id, requestedScopes) => {
        assert.deepEqual(listingProblems(`${id}.json`, { id, requestedScopes }, known), []);
      }),
    );
  });

  it("reports exactly one problem per violated rule and names the offending value", () => {
    fc.assert(
      fc.property(
        listingId,
        listingId,
        fc.array(fc.stringMatching(/^X\.[A-Za-z]{1,10}$/), { minLength: 1, maxLength: 5 }),
        (fileId, manifestId, bogus) => {
          const idMismatch = fileId !== manifestId;
          const problems = listingProblems(`${fileId}.json`, { id: manifestId, requestedScopes: bogus }, known);
          assert.equal(problems.length, idMismatch ? 2 : 1);
          assert.ok(problems.every((p) => p.startsWith(`${fileId}.json:`)));
          assert.ok(bogus.every((s) => problems.some((p) => p.includes(s))));
        },
      ),
    );
  });
});

describe("shipped listings", () => {
  it("every listing in listings/ passes the offline checks", () => {
    for (const file of readdirSync(path.join(root, "listings")).filter((f) => f.endsWith(".json"))) {
      const manifest = JSON.parse(readFileSync(path.join(root, "listings", file), "utf8"));
      assert.deepEqual(listingProblems(file, manifest, known), [], file);
    }
  });
});
