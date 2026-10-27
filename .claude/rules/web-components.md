---
paths:
  - "apps/web/src/**/*.tsx"
---

- Reuse `apps/web/src/components/` before writing new markup: PageHeader, Card, Table and
  CellText, Drawer and DrawerSection, DescriptionList, StatGroup, SegmentedControl, Badge,
  Button, Modal, TextField, SelectField, FieldRow, FormActions, FormError, EmptyState,
  QueryBoundary, Icon.
- Named exports only. One component per file, the file named after it.
- No inline `style={{ ... }}` except for computed values (a width in percent): use the
  component's CSS module.
- Pages render query states through `QueryBoundary`, never their own spinners.
- A row's detail opens in a `Drawer` from a child route, not on a page of its own.
