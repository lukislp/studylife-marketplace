# StudyLife Marketplace

A public catalog of add-ons for [StudyLife](https://github.com/lukislp/studylife) — self-hosted
study-tracking software. Every StudyLife instance is privately hosted by its own owner (nothing
here needs to be, or ever is, publicly reachable except this repository); this catalog is the one
shared, public piece that lets any instance discover what add-ons exist.

## How it works

1. A developer registers their add-on against their **own** StudyLife instance, using the
   [studylife-developers](https://github.com/lukislp/studylife-developers) portal — picking a
   name, the scopes their add-on needs, and a redirect URI.
2. They submit a manifest here as a **pull request** — see [CONTRIBUTING.md](CONTRIBUTING.md).
   The manifest is a pointer (name, description, a link to the add-on's own repository), never
   the add-on's actual code.
3. Once merged, any StudyLife instance's own Setup-page marketplace modal can find it — each
   instance fetches this repository's `listings/` directory read-only, entirely independent of
   who owns which instance.
4. Installing happens locally, on whichever instance the installing user owns — this repository
   is never involved in, and never sees, that step.

## What lives here

- `listings/*.json` — one manifest per add-on, validated against [`schema/manifest.schema.json`](schema/manifest.schema.json).
- `schema/known-scopes.json` — the current list of scopes an add-on may request. Mirrors
  `ApiKeyScopes.PubliclyGrantable` in the [studylife](https://github.com/lukislp/studylife) repo;
  kept in sync by hand since it changes rarely.

## What does NOT live here

Add-on source code. `repository`/`homepage` in a manifest point to wherever the developer
actually hosts and releases their add-on — this repository holds pointers only, under CI
validation, nothing more.
