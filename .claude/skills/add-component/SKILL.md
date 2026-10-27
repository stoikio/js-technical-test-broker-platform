---
name: add-component
description: Add or extend a reusable UI component in apps/web/src/components. Use when a piece of UI is needed on more than one page, or when asked to build a button, table, badge, field, drawer section or similar building block.
---

# Add a reusable component

First check `apps/web/src/components/` and the table in `apps/web/AGENTS.md`: extend an
existing component (a `variant`, `tone`, `size` or optional prop) rather than creating a
near-duplicate.

1. Create `apps/web/src/components/<Name>/<Name>.tsx` and `<Name>.module.css`.
2. Named export, typed props. Accept `children` / `ReactNode` slots rather than page-specific
   props. Spread native attributes when the component wraps a native element, and join
   classes with `cx`:

   ```tsx
   import type { ButtonHTMLAttributes } from 'react';

   import { cx } from '@/utils/cx';

   import styles from './Chip.module.css';

   type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

   export function Chip({ selected = false, className, ...props }: ChipProps) {
     return (
       <button type="button" className={cx(styles.chip, selected && styles.selected, className)} {...props} />
     );
   }
   ```

3. Style with the tokens of `src/styles/global.css`, so it matches the rest of the app:
   - text `--color-text`, secondary `--color-text-secondary`, labels `--color-text-muted`;
   - borders `--color-border` (`--color-border-strong` on inputs);
   - surfaces `--color-surface`, hover `--color-surface-hover`, selected `--color-surface-active`;
   - primary actions `--color-primary`; statuses use a `--tone-*-bg` / `--tone-*-text` pair;
   - controls are `--control-height` high with `--radius-sm`, surfaces use `--radius-md`;
   - 14px body text, 12px for labels and hints, 500 weight for emphasis.
   Add a token rather than a hardcoded color.
4. No data fetching and no routing inside `components/` (the app shell is the exception: it
   renders the router outlet and the space navigation). Data belongs to pages in `features/`.
5. Add a test next to it when it has logic (mapping a state to a label, filtering), with
   `renderToStaticMarkup` from `react-dom/server`, wrapped in a `MemoryRouter` if it uses the
   router. See `components/AppShell/SpaceSwitcher.test.tsx`.
6. List it in the components table of `apps/web/AGENTS.md`. Typecheck, lint, test.
