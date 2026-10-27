---
paths:
  - "apps/web/src/**/*.css"
---

- Colors, radii, shadows and sizes come from the CSS variables in
  `apps/web/src/styles/global.css`: the neutral `--gray-0` to `--gray-9` scale, `--color-*`
  roles, and `--tone-*-bg` / `--tone-*-text` pairs for statuses.
- Class names are camelCase in CSS modules (`.sectionLabel`), read as `styles.sectionLabel`.
- Match the app shell: light gray app background, white raised content panel, 4px radius on
  controls and badges' pill shape, 8px radius on surfaces, 1px `--color-border` lines between sections,
  14px body text and 12px muted labels.
