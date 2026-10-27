---
name: add-component
description: Add or extend a reusable UI component in apps/web/src/components. Use when a piece of UI is needed on more than one page, or when asked to build a button, table, badge, field or similar building block.
---

# Add a reusable component

First check `apps/web/src/components/`: extend an existing component (a new `variant`, `tone` or
optional prop) rather than creating a near-duplicate.

1. Create `apps/web/src/components/<Name>/<Name>.tsx` and `<Name>.module.css`.
2. Named export, typed props. Accept `children` / `ReactNode` slots instead of page-specific
   props. Spread native attributes when the component wraps a native element:

   ```tsx
   import type { ButtonHTMLAttributes } from 'react';

   import styles from './Chip.module.css';

   type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

   export function Chip({ selected = false, className, ...props }: ChipProps) {
     return <button type="button" className={selected ? `${styles.chip} ${styles.selected}` : styles.chip} {...props} />;
   }
   ```

3. Style with CSS variables from `src/styles/global.css` (`var(--color-primary)`,
   `var(--radius-sm)`). Add a token there rather than a hardcoded color.
4. No data fetching and no routing inside `components/`: those belong to pages in `features/`.
5. Add a test next to it when it has logic (mapping a state to a label, formatting), using
   `renderToStaticMarkup` from `react-dom/server`. See
   `features/admin/PaymentStateBadge.test.tsx`.
6. Typecheck, lint, test.
