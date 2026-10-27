---
name: add-page
description: Add a page to the web app (apps/web), with its route, sidebar entry and breadcrumb. Use when asked to create a new screen, tab or detail page in the front end.
---

# Add a page

1. **Pick the feature folder**: `apps/web/src/features/<area>/`. Areas match the sidebar
   (`prospects`, `clients`, `admin`). Create a new area only for a new sidebar section.
2. **Write the page** as `<Name>Page.tsx`, named export:

   ```tsx
   export function WidgetsPage() {
     const widgets = useWidgets();

     return (
       <>
         <PageHeader title="Widgets" description="One line on what the page is for." />
         <QueryBoundary query={widgets}>
           {(rows) => (
             <Table columns={columns} rows={rows} getRowKey={(row) => row.id} empty={<EmptyState title="No widgets" />} />
           )}
         </QueryBoundary>
       </>
     );
   }
   ```

   - Read route params with `useParams()` and default them (`const { widgetId = '' } = useParams()`).
   - Data comes from a hook in `src/api/` (see the `call-api` skill), never `fetch`.
   - Declare table columns as a `Column<Row>[]` constant outside the component when they do not
     need component state.
3. **Register the route** in `apps/web/src/app/router.tsx`, under the `AppShell` children, with
   `handle: crumb('Label')` so the top bar breadcrumb shows it. Detail pages nest under their
   list route.
4. **Add a sidebar link** in `apps/web/src/app/navigation.ts` if the page is a top-level entry.
   Add an icon path in `components/Icon/Icon.tsx` if none fits.
5. **Check**: typecheck, lint, then open the page with `pnpm dev` and verify loading, empty and
   error states.
