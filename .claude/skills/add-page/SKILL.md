---
name: add-page
description: Add a page or a detail drawer to the web app (apps/web), in the broker space or the admin space, with its route, sidebar link and breadcrumb. Use when asked to create a new screen, list, detail view or tab in the front end.
---

# Add a page or a drawer

## 1. Pick the space

| Space        | Prefix    | Folder                       | Holds                             |
| ------------ | --------- | ---------------------------- | --------------------------------- |
| Broker space | `/broker` | `apps/web/src/features/broker/` | prospects, quotes, clients, contracts |
| Admin        | `/admin`  | `apps/web/src/features/admin/`  | invoices, payments                 |

A page belongs to one space. Domain UI needed by both (a status badge) goes to
`features/shared/`.

## 2. A list or detail page

Create `features/<space>/<area>/<Name>Page.tsx`, named export:

```tsx
export function WidgetsPage() {
  const navigate = useNavigate();
  const { widgetId } = useParams();
  const widgets = useWidgets();

  return (
    <>
      <PageHeader
        title="Widgets"
        description="One line on what the page is for."
        actions={<Button leftIcon="plus" onClick={() => navigate('new')}>New widget</Button>}
      />
      <QueryBoundary query={widgets}>
        {(rows) => (
          <Table
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            selectedRowKey={widgetId}
            onRowClick={(row) => navigate(`/admin/widgets/${row.id}`)}
            empty={<EmptyState icon="inbox" title="No widgets" />}
          />
        )}
      </QueryBoundary>
      <Outlet />
    </>
  );
}
```

- `PageHeader` first, then `StatGroup`, `SegmentedControl`, `Card`s as needed.
- Declare columns as a `Column<Row>[]` constant outside the component; use `CellText` for a
  name with a muted second line, `Badge` for statuses, `align: 'right'` for amounts.
- Read params with `useParams()` and default them (`const { widgetId = '' } = useParams()`).
- Data comes from a hook in `src/api/` (see the `call-api` skill), never `fetch`.

## 3. A detail in a drawer

Details of a row open in a drawer over the list, from a child route:

```tsx
export function WidgetDrawer() {
  const { widgetId = '' } = useParams();
  const navigate = useNavigate();
  const widget = useWidget(widgetId);

  return (
    <Drawer
      preTitle="Widget"
      title={widget.data?.name ?? 'Widget'}
      titleExtra={widget.data && <WidgetStatusBadge status={widget.data.status} />}
      onClose={() => navigate('/admin/widgets')}
      footer={<Button onClick={save}>Save</Button>}
    >
      <QueryBoundary query={widget}>
        {(detail) => (
          <DrawerSection title="Details">
            <DescriptionList layout="rows" items={[{ label: 'Name', value: detail.name }]} />
          </DrawerSection>
        )}
      </QueryBoundary>
    </Drawer>
  );
}
```

The list page must render `<Outlet />` for the drawer to show.

## 4. Register the route

In `apps/web/src/app/routes.tsx`, under the space's tree:

```tsx
{
  id: 'admin.widgets',
  path: 'widgets',
  element: <WidgetsPage />,
  handle: handle('Widgets', 'inbox'),
  children: [{ id: 'admin.widget', path: ':widgetId', element: <WidgetDrawer /> }],
},
```

- `handle(crumb, icon)` puts the page in the header breadcrumb. For a label that depends on
  the params (a name), pass a component like `CompanyCrumb`.
- Give every route an `id` and add the URL to the table in `src/app/routes.test.ts`.

## 5. Sidebar link

For a top-level page, add `{ label, to, icon }` to the space's `navigation` in
`apps/web/src/app/spaces.ts`. Add an icon path in `components/Icon/Icon.tsx` if none fits.
`spaces.test.ts` and `routes.test.ts` check that every link has a page in its space.

## 6. Check

Typecheck, lint, tests, then open the page with `pnpm dev`: loading, empty and error states,
the drawer opens and closes with its URL, and the breadcrumb and sidebar show the right space.
