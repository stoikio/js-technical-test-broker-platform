---
paths:
  - "apps/web/src/**/*.tsx"
---

- Reuse `apps/web/src/components/` (Button, Badge, Table, PageHeader, Card, EmptyState, Modal,
  TextField, SelectField, FormError, DescriptionList, QueryBoundary) before writing new markup.
- Named exports only. One component per file, the file named after it.
- No inline `style={{ ... }}`: use the component's CSS module.
- Pages render query states through `QueryBoundary`, never their own spinners.
