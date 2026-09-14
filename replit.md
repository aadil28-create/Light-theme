# Live Quiz UI System

Frontend/UI design donor for a production real-time live quiz platform, focused on reusable shells and structural states rather than backend behavior.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The current design donor intentionally does not require a database or API server.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mockup-sandbox/src/components/mockups/live-quiz/` — live host and participant shell previews plus shared primitives
- `artifacts/mockup-sandbox/src/components/mockups/live-quiz/_shared/demoData.ts` — isolated visual-only demo data
- `artifacts/mockup-sandbox/src/components/mockups/live-quiz/_group.css` — Signalhouse visual tokens, typography, and motion

## Architecture decisions

- The existing production backend remains authoritative; this project is UI-only and must not grow replacement networking, auth, scoring, timers, or persistence.
- Host and participant experiences are separate previews because their primary operating environments differ: desktop for hosts, narrow mobile for participants.
- Route placeholders use local preview navigation only, so the shell can be evaluated without pretending to implement production session state.
- Shared shell primitives live beside the mockups and demo data is kept separate from reusable UI pieces.

## Product

The first stage provides a polished Signalhouse visual system, a desktop host command center, a mobile participant waiting room, role switching, route placeholders, connection/status states, and foundational loading/empty/error/confirmation components.

## User preferences

- Keep future work within the staged scope of the frontend UI donor unless the user explicitly requests integration work.

## Gotchas

- Do not hardcode the old production hostname or add a replacement backend.
- Keep mockup styles self-contained; avoid changing the sandbox-wide `src/index.css` for one design direction.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
