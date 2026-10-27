# Harbor

Broker workspace: prospects, quotes, client contracts, invoicing and payments.

## Prerequisites

- Node 24 and pnpm 12, or
- Docker with Compose

## Start

With pnpm, from the repository root:

```sh
pnpm install
pnpm dev
```

With Docker:

```sh
docker compose up
```

Both start the API and the web app with hot reload. The API applies pending migrations and
loads demo data into an empty database on startup. `pnpm --filter @broker/api db:reset`
deletes the local database (the Docker one lives in the `api_data` volume).

| Service | URL                   |
| ------- | --------------------- |
| Web     | http://localhost:5173 |
| API     | http://localhost:3000 |

## Checks

```sh
pnpm test        # Vitest, API and web
pnpm typecheck   # TypeScript 7
pnpm lint        # oxlint
pnpm format      # oxfmt
```
