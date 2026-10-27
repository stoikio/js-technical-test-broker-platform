---
name: call-api
description: Call an API endpoint from the web app through TanStack Query hooks in apps/web/src/api. Use when a page or drawer needs data from, or sends data to, the API.
---

# Call the API

The front end only talks to the API through hooks in `apps/web/src/api/`.

1. **Check the endpoint** in the API code (`apps/api/src/<context>/use-cases/<name>/controller.http.ts`
   for the route, `dto.http.ts` for the body, the mapper in `infra/mappers/` for the response).
   With the API running: `curl -s localhost:3000/<path> | jq`.
2. **Type the response** in `apps/web/src/api/types.ts`. Amounts are `Money`
   (`{ amount, currency }`, minor units), dates are strings.
3. **Add the hook** to the file of the area (`companies.ts` for the broker space data,
   `billing.ts` for the admin space data) or a new `src/api/<area>.ts`:

   ```ts
   export const widgetKeys = {
     list: ['widgets'] as const,
     detail: (widgetId: string) => ['widgets', widgetId] as const,
   };

   export const useWidget = (widgetId: string) =>
     useQuery({
       queryKey: widgetKeys.detail(widgetId),
       queryFn: () => api.get<Widget>(`/widgets/${widgetId}`),
     });

   export const useCreateWidget = () => {
     const queryClient = useQueryClient();

     return useMutation({
       mutationFn: (body: { name: string }) => api.post<Widget>('/widgets', body),
       onSuccess: () => queryClient.invalidateQueries({ queryKey: widgetKeys.list }),
     });
   };
   ```

   - Paths are relative to the API root: `api.get('/invoices')` hits `/api/invoices`, which
     Vite proxies to the API.
   - Every mutation invalidates the queries it makes stale, including those shown by the
     other space (accepting a quote issues an invoice).
   - A list and its drawer can share one query: the drawer finds its row in the cached list
     (see `QuoteDrawer`), or fetches the detail endpoint when there is one (`useInvoice`).
4. **Handle errors**: a failed call throws `ApiError` with `status`, `code` (for example
   `billing.payment.amountExceedsUnapplied`) and `details`. Show `errorMessage(error)` in a
   `FormError`; branch on `error.code` only when the UI must react differently.
5. Typecheck, then try it in the browser with `pnpm dev`.
