# Web app

React SPA of Harbor, split in two **spaces**, each with its own URL prefix, sidebar and pages:

| Space        | Prefix    | For                                                         |
| ------------ | --------- | ----------------------------------------------------------- |
| Broker space | `/broker` | Prospects and their quotes, clients and their contracts     |
| Admin        | `/admin`  | Invoices and their payment state, payments and applications |

The space switcher at the top of the sidebar moves between them. There are no users and no
sign-in: every space is open.

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
  main.tsx              entry: QueryClient, router, global styles
  app/
    spaces.ts           the spaces: label, prefix, home page, sidebar navigation
    routes.tsx          every route, one tree per space under its AppShell
    router.ts           createBrowserRouter(routes)
  api/
    client.ts           fetch wrapper, ApiError, errorMessage
    types.ts            response shapes of the API
    companies.ts        hooks for companies, quotes, contracts
    billing.ts          hooks for invoices and payments
  components/           reusable UI, one folder per component (see below)
  features/
    broker/
      prospects/        prospects list, prospect page, quote drawer, creation modals
      clients/          clients list, client page, contract drawer
      CompanyCrumb.tsx  breadcrumb label of company routes
    admin/
      invoices/         invoices list with filters, invoice drawer
      payments/         payments list, record payment drawer, payment forms
    shared/             domain UI used by both spaces (payment state badge, due date)
  utils/                pure helpers (formatting, money parsing, cx), unit tested
  styles/global.css     design tokens and resets
```

## Route map

```
/                                                  -> /broker/prospects
/broker                                            -> /broker/prospects
/broker/prospects                                  prospects list
/broker/prospects/:companyId                       prospect page with its quotes
/broker/prospects/:companyId/quotes/:quoteId       + quote drawer (accept the quote)
/broker/clients                                    clients list
/broker/clients/:companyId                         client page: contracts, invoices
/broker/clients/:companyId/contracts/:contractId   + contract drawer
/admin                                             -> /admin/invoices
/admin/invoices                                    invoices list, filters by payment state
/admin/invoices/:invoiceId                         + invoice drawer: applied payments, payment panel
/admin/payments                                    payments list
/admin/payments/new                                + record payment drawer
```

`+` marks a drawer over the page above it. `src/app/routes.test.ts` checks this map: update
both together.

## Components

| Component                                                          | Use it for                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `AppShell`                                                         | Layout of a space: sidebar, breadcrumb header, page in a raised panel                       |
| `SpaceSwitcher`                                                    | Top of the sidebar, rendered by `AppShell`, never by pages                                  |
| `PageHeader`                                                       | First element of every page: title, badge, description, actions                             |
| `Card`                                                             | A titled block of a page: heading, count, actions, content                                  |
| `Table`, `CellText`                                                | Every list. `onRowClick` opens a detail, `selectedRowKey` marks it while its drawer is open |
| `Drawer`, `DrawerSection`                                          | Detail of a row over its list, from a child route                                           |
| `DescriptionList`                                                  | Label and value pairs: `grid` on a page, `rows` in a drawer                                 |
| `StatGroup`                                                        | Key figures above a list                                                                    |
| `SegmentedControl`                                                 | Filters of one list                                                                         |
| `Badge`                                                            | Statuses: soft tone, uppercase, optional dot                                                |
| `Button`                                                           | `primary` for the main action, `default` for others, `subtle` in tables                     |
| `Modal`                                                            | Short creation forms (new prospect, new quote)                                              |
| `TextField`, `SelectField`, `FieldRow`, `FormActions`, `FormError` | Forms, inline in a drawer section or in a modal                                             |
| `EmptyState`                                                       | `Table`'s `empty` prop and empty sections                                                   |
| `QueryBoundary`                                                    | Loading skeleton and error of a query                                                       |
| `Icon`                                                             | Outline icons: add a path in `Icon.tsx` rather than an icon package                         |

## Conventions

- **Spaces.** A page belongs to exactly one space and lives in `features/<space>/`. Its route
  goes under that space's tree in `routes.tsx`, and a top-level page gets a sidebar link in
  `src/app/spaces.ts`. Link within the space with its prefix (`/admin/invoices/${id}`) or
  relatively (``navigate(`quotes/${id}`)``). Pages do not link into the other space: the
  user switches spaces.
- **Details open in a drawer.** The list page renders `<Outlet />` last. The detail is a child
  route whose element renders `<Drawer>` and closes by navigating back to the list, so it has
  its own URL, and Escape or a click on the overlay closes it.
- **Breadcrumb.** A route opts in with `handle: { crumb, icon }`. `crumb` is a label, or a
  component that reads the route params and returns one (see `CompanyCrumb`).
- **Imports** use the `@/` alias (`@/components/Table/Table`), except a component's own
  stylesheet and siblings in the same folder (`./Badge.module.css`, `./QuoteStatusBadge`).
- **Components** live in `src/components/<Name>/<Name>.tsx` with a `<Name>.module.css`.
  Named exports only. A component that one feature uses stays in that feature's folder;
  domain UI used by both spaces goes to `features/shared/`.
- **Data** is fetched only through hooks in `src/api/*.ts` (TanStack Query). Components never
  call `fetch` or `api.get` directly. Mutations invalidate the queries whose data they change.
- **Money** is always minor units (cents) with a currency, as the API sends it. Display it with
  `formatMoney`, read user input with `parseAmountInput`. Never use floats for amounts.
  Payment amounts are signed: negative is money paid out, such as a refund.
- **Dates** from the API are `YYYY-MM-DD` days or ISO timestamps: show them with `formatDate`.
- **Styling** goes through the CSS variables of `global.css`: the gray scale `--gray-0` to
  `--gray-9`, `--color-*` roles, `--tone-*` for badges, `--radius-*`, `--shadow-*`. Do not
  hardcode colors. Join class names with `cx`.
- **Errors** from the API are shown with `FormError` and `errorMessage(error)`.
- **Tests** sit next to the code (`*.test.ts(x)`), Vitest. Test pure helpers directly, routes
  and spaces with `matchRoutes`, components with `renderToStaticMarkup` from
  `react-dom/server`, wrapped in a `MemoryRouter` when they use the router.
- Copy is in English, sentence case ("Record a payment", not "Record A Payment").

## How to

- Add a page or a drawer: `.claude/skills/add-page/SKILL.md`.
- Add a reusable component: `.claude/skills/add-component/SKILL.md`.
- Call a new API endpoint: `.claude/skills/call-api/SKILL.md`.

## Before you call it done

`pnpm --filter @broker/web typecheck`, `pnpm --filter @broker/web test` and `pnpm lint` pass,
and the page works in the browser against the running API (`pnpm dev` at the root), in the
right space.
