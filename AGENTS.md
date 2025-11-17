# Ever Works Website – Agent Instructions (Cursor)

These instructions are for **Cursor agents** (Chat/Agent) working in this repository.

For full project details (env vars, build/run/test commands, docs, patterns), see the root-level `CLAUDE.md` file.

## Runtime & tooling

- Use **Node.js >= 20.19.0**.
- Use **pnpm** as the package manager.
- Run all commands from the **repository root**.

## Build, dev, and verification

Use these commands:

- `pnpm dev` – start the dev server at `http://localhost:3000`.
- `pnpm build` – production build (generates OpenAPI docs and static pages).
- `pnpm start` – serve the production build.
- `pnpm lint` – ESLint.
- `pnpm tsc --noEmit` – TypeScript type-check.

Treat as the main verification steps:

- For quick checks: run `pnpm lint` and `pnpm tsc --noEmit`.
- For larger or infra-level changes: also run `pnpm build`.

## Environment & data

- Assume `.env.local` already exists and is correctly configured.
- Do **not** create, modify, or print env secrets unless the user explicitly asks.
- Content is loaded from the Git-based CMS repo pointed to by `DATA_REPOSITORY`.

## Code organization

- Next.js App Router under `app/[locale]/**` and `app/api/**`.
- Shared business logic lives in `lib/services/**` and `lib/repositories/**`.
- Database schema and helpers in `lib/db/**` (Drizzle ORM).
- UI and layout components live in `components/**`.
- Prefer **TypeScript** for all code.

When implementing features:

- Put domain / business logic in `lib/**`.
- Keep React components focused on rendering and wiring.

## Safety & side effects

Avoid by default (ask the user first):

- Installing new dependencies (`pnpm add`, `pnpm install` with changes).
- Running database migrations or seeding against anything other than local dev DB.
- Destructive scripts or scripts that modify production-like data.

Safe to run when needed:

- `pnpm lint`
- `pnpm tsc --noEmit`
- `pnpm build`
- `pnpm dev`

## Source of truth

- This file gives **high-level rules** for Cursor.
- For deeper details (scripts, env vars, docs, architecture, coding style), **refer to `CLAUDE.md` at the repo root** and the external docs repo at
  <https://github.com/ever-works/ever-works-docs/tree/develop/website/docs>.

