# Web app

React SPA for the broker workspace: prospects, clients and the admin area (invoices, payments).
React 19, Vite, React Router, TanStack Query. No UI library: components are ours, styled with
CSS modules and the design tokens of `src/styles/global.css`.

## Commands

Run from the repository root:

| What              | Command                               |
| ----------------- | ------------------------------------- |
| Dev server (5173) | `pnpm --filter @broker/web dev`       |
| Tests             | `pnpm --filter @broker/web test`      |
| Typecheck (TS 7)  | `pnpm --filter @broker/web typecheck` |
| Lint / format     | `pnpm lint` / `pnpm format`           |

The dev server proxies `/api/*` to the API (`API_URL`, default `http://localhost:3000`), with
the `/api` prefix stripped. Always call the API through `src/api/client.ts`, never with a
hardcoded host.

## Layout

```
src/
  main.tsx            entry: QueryClient, router, global styles
  app/
    router.tsx        every route, nested under the AppShell
    navigation.ts     sidebar sections and links
  api/
    client.ts         fetch wrapper, ApiError
    types.ts          response shapes of the API
    companies.ts      query and mutation hooks for companies, quotes, contracts
    billing.ts        query and mutation hooks for invoices and payments
  components/         reusable UI, one folder per component
  features/
    prospects/        pages and modals of the Prospects tab
    clients/          pages of the Clients tab
    admin/            invoices and payments pages (Admin section of the sidebar)
  utils/              pure helpers (formatting, money parsing), unit tested
  styles/global.css   design tokens (colors, radius, layout sizes) and resets
```

## Conventions

- **Imports** use the `@/` alias (`@/components/Table/Table`), except a component's own
  stylesheet and siblings inside the same feature folder (`./Badge.module.css`, `./NewQuoteModal`).
- **Components** live in `src/components/<Name>/<Name>.tsx` with a `<Name>.module.css` next to
  them. Named exports only, props typed inline or as `<Name>Props`. A component that only one
  page uses lives in that feature folder instead.
- **Pages** are `features/<area>/<Name>Page.tsx`, registered in `app/router.tsx`. A page starts
  with `PageHeader`, groups its content in `Card`s and renders query states through
  `QueryBoundary`.
- **Data** is fetched only through hooks in `src/api/*.ts` (TanStack Query). Components never
  call `fetch` or `api.get` directly. Mutations invalidate the queries whose data they change.
- **Money** is always minor units (cents) with a currency, as the API sends it. Display it with
  `formatMoney`, read user input with `parseAmountInput`. Never use floats for amounts.
- **Dates** from the API are `YYYY-MM-DD` days or ISO timestamps: show them with `formatDate`.
- **Styling** goes through CSS variables from `global.css`; do not hardcode colors.
- **Forms** use the `Modal` with `onSubmit`, `TextField` / `SelectField`, and `FormError` for the
  API error (`errorMessage(error)`).
- **Tests** sit next to the code (`*.test.ts(x)`), Vitest. Test pure helpers directly and
  components with `renderToStaticMarkup` from `react-dom/server`.
- Copy is in English, sentence case ("Record a payment", not "Record A Payment").

## How to

- Add a page: see `.claude/skills/add-page/SKILL.md`.
- Add a reusable component: see `.claude/skills/add-component/SKILL.md`.
- Call a new API endpoint: see `.claude/skills/call-api/SKILL.md`.

## Before you call it done

`pnpm --filter @broker/web typecheck`, `pnpm --filter @broker/web test` and `pnpm lint` pass,
and the page works in the browser against the running API (`pnpm dev` at the root).
