# Listings

One JSON file per add-on, named `<id>.json` where `<id>` matches the manifest's own `id` field.
See [CONTRIBUTING.md](../CONTRIBUTING.md) for the schema and how to submit one via pull request.

Every file here is checked in CI by `scripts/validate-listings.mjs`: against the schema, for
unknown scopes, and that its `repository` URL actually resolves.

A listing is either an `oauth` listing (the default; carries a `redirectUriPattern`, installed with one
click) or a `manual` one (`"install": "manual"` plus a `setupUrl`, for self-hosted add-ons with no fixed
redirect URI). The two are mutually exclusive in the schema and re-checked in `scripts/listing-checks.mjs`.
