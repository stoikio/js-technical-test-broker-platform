---
paths:
  - "apps/web/src/app/**"
  - "apps/web/src/features/**"
---

- The app has two spaces: broker (`/broker`, `features/broker/`) and admin (`/admin`,
  `features/admin/`). A page belongs to one of them; code used by both goes to
  `features/shared/`.
- Spaces, their home pages and sidebar links are declared in `src/app/spaces.ts` only. Routes
  live in `src/app/routes.tsx`, one tree per space under its `AppShell`.
- Every route has an `id`, and `src/app/routes.test.ts` lists every URL: change both together.
- Pages do not link into the other space; the space switcher moves between them.
