# GitHub Copilot Instructions – Ever Works Website

These instructions customize **GitHub Copilot** for this repository.

For full project details (build/run/test, env, architecture, docs), Copilot should treat the root `CLAUDE.md` file as the primary reference.

## Runtime & tooling

- Use **Node.js >= 20.19.0**.
- Use **pnpm** as the package manager (not npm or yarn).
- Assume commands are run from the **repository root**.

## How to run and verify

Preferred commands:

- `pnpm dev` – start the dev server.
- `pnpm build` – production build.
- `pnpm start` – run the built app.
- `pnpm lint` – lint the codebase.
- `pnpm tsc --noEmit` – TypeScript type-check.

Treat the following as the main "tests":

- `pnpm lint`
- `pnpm tsc --noEmit`
- `pnpm build` (for larger changes or when explicitly asked to ensure production readiness).

## Project structure

- Routes and pages: `app/[locale]/**`, `app/api/**` (Next.js App Router).
- UI components: `components/**`.
- Business logic: `lib/services/**`.
- Data access / repositories: `lib/repositories/**`.
- Database schema & tooling: `lib/db/**`, `drizzle.config.ts`.

When generating or editing code, Copilot should:

- Prefer **TypeScript** files.
- Keep React components mostly presentational and lean.
- Put business logic and data access into `lib/services/**` and `lib/repositories/**` rather than components.

## Dependencies & commands to avoid by default

Unless explicitly requested by the user, Copilot should **avoid** suggesting or running:

- Adding new dependencies (`pnpm add`, `pnpm install` with changes).
- Database migrations or seeding against production-like databases.
- Destructive scripts that delete or rewrite data.

It is **safe** to suggest and run (for verification):

- `pnpm lint`
- `pnpm tsc --noEmit`
- `pnpm build`
- `pnpm dev`

## Documentation

When Copilot needs more context about architecture, auth, payments, theming, or API design, it should:

- First consult `CLAUDE.md` in the repo root.
- Then, if needed, refer to the external docs repo at
  <https://github.com/ever-works/ever-works-docs/tree/develop/website/docs>.

