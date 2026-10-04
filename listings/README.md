# Listings

One JSON file per add-on, named `<id>.json` where `<id>` matches the manifest's own `id` field.
See [CONTRIBUTING.md](../CONTRIBUTING.md) for the schema and how to submit one via pull request.

Every file here is checked in CI by `scripts/validate-listings.mjs`: against the schema, for
unknown scopes, and that its `repository` URL actually resolves.
