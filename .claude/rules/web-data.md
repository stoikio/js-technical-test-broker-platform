---
paths:
  - "apps/web/src/**"
---

- Fetch and mutate only through hooks in `apps/web/src/api/`; no `fetch` in components.
- Response types live in `apps/web/src/api/types.ts` and mirror the API as it is. Do not
  reshape API data inside hooks.
- Amounts are integers in minor units with a currency. Format with `formatMoney`, parse input
  with `parseAmountInput`. Never `parseFloat` an amount.
