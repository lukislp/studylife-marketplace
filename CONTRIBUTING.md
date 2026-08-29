# Submitting an add-on

## Prerequisites

Before opening a pull request, you should already have:

1. Built your add-on against your **own** StudyLife instance, registering it via
   [studylife-developers](https://github.com/lukislp/studylife-developers) (the same generic
   connect flow every other StudyLife satellite uses — see that repo's own README for the exact
   steps).
2. Tested the full connect → consent → callback round trip end to end, against your own account.
3. A public repository your add-on's actual code lives in, with at least a README explaining what
   it does and how to run/install it.

## Steps

1. Fork this repository.
2. Add exactly one new file: `listings/<your-id>.json`, following the schema below. `<your-id>`
   must be the identical slug you used as the `ClientId` when registering your add-on (lowercase
   letters, digits, and hyphens only).
3. Open a pull request. CI validates automatically:
   - the file matches [`schema/manifest.schema.json`](schema/manifest.schema.json)
   - `id` matches the filename
   - `repository` resolves (not a 404, not a private repo)
   - every entry in `requestedScopes` is a member of [`schema/known-scopes.json`](schema/known-scopes.json)
4. A maintainer reviews and merges. Review is a lightweight sanity check of the manifest fields —
   name, description, and requested scopes make sense together — not a code audit of your add-on;
   installing any add-on remains at each user's own judgment and risk.

## Manifest schema

```json
{
  "id": "example-addon",
  "name": "Example Add-on",
  "description": "One or two sentences describing what this add-on does.",
  "developer": "Your name or handle",
  "repository": "https://github.com/you/example-addon",
  "homepage": "https://github.com/you/example-addon#readme",
  "requestedScopes": ["webhooks:manage", "notes:read"],
  "redirectUriPattern": "https://your-addon.example.com/studylife/callback"
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Lowercase slug, must match the filename and your registered `ClientId` |
| `name` | yes | Shown on the consent screen and in the marketplace modal |
| `description` | yes | One or two sentences, shown in the marketplace modal |
| `developer` | yes | Your name or handle |
| `repository` | yes | Where your add-on's actual code lives - checked by CI to resolve |
| `homepage` | no | Install/setup instructions, if separate from the repository's own README |
| `requestedScopes` | yes | See [`schema/known-scopes.json`](schema/known-scopes.json) for the current list |
| `redirectUriPattern` | yes | The redirect URI your add-on registered - informational, for reviewers |

## Updating an existing listing

Open a PR editing your own `listings/<your-id>.json` file. Changing `requestedScopes` here is
purely informational for the catalog — it does not by itself change what any already-issued key
can do; users who already installed your add-on keep whatever they originally consented to (see
studylife's own `ClientApiKeyEntity.GrantedScopes`). Existing users only see and approve a wider
grant if they explicitly reconnect your add-on on their own instance.

## Removing a listing

Open a PR deleting your `listings/<your-id>.json` file. This only removes future discoverability
in the catalog — it has no effect on already-installed instances (revoke access there yourself,
on your own instance, if that's what you intend).
