# Broker platform

## The case

You join the team that builds the platform brokers use to sell insurance to companies. This
repository is the product as it stands today.

In the session you will be given a product need to build on top of it, the way you would get one
from a product manager. It will be short on purpose: part of the job is to understand what is
really being asked, so you will ask us product and technical questions, then:

1. propose a high-level design: which entities are involved, how they interact, and how the change
   fits what already exists;
2. implement part of it;
3. review the result with us.

You do not need to prepare a solution. Before the session, please:

1. get the stack running on your machine (see [Start](#start)), and
2. spend some time reading the code and clicking through the app.

You can use an AI coding assistant during the session, so have one ready on your machine. You will
be expected to understand and review what it produces.

## Product

Harbor is the workspace a broker uses to follow a company from prospect to client:

1. a **quote** is issued to a company (a number of units at a unit price);
2. accepting the quote creates a **contract** for one year and its **invoice**;
3. **payments** are recorded and applied to invoices. A payment is signed from the platform's
   point of view: positive is money in, negative is money out.

Amounts are integers in cents. There is no authentication.

## Codebase

```
apps/api   Hono API, SQLite, TypeScript run directly by Node (no build step)
apps/web   React app with two spaces: broker (prospects, clients) and admin (invoices, payments)
```

The API follows a clean architecture, split into two bounded contexts:

| Context     | Owns                    |
| ----------- | ----------------------- |
| `insurance` | company, quote, contract |
| `billing`   | invoice, payment        |

Each context is organised as `domain/` (entities, value objects, ports), `use-cases/`, `infra/`
(adapters, mappers) and `tests/` (builders, fixtures). Contexts talk to each other through events
declared in `shared-kernel/`. Shared building blocks live in `core/`.

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
