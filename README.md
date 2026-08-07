# SF6 Ranked Lab

A full-stack TanStack Start application for ranked Street Fighter 6 matchup
analytics. It serves compact, committed Buckler battle-diagram snapshots through
Zod-validated oRPC procedures and TanStack Query.

## Quick start

```bash
bun install
bun run dev
```

App URL: `http://localhost:3000`

## Scripts

- `bun run dev` — start dev server
- `bun run build` — build for production
- `bun run start` — preview production build
- `bun run sync` — download missing raw Buckler snapshots and check for new periods
- `bun run normalize` — deterministically regenerate all processed snapshots from local raw data
- `bun run test` — run Bun's built-in test suite
- `bun run format` — format with oxfmt
- `bun run lint` — lint with oxlint (type-aware, with fixes)
- `bun run check` — format, lint (with fixes), and type-check
- `bun run routes:generate` — regenerate the route tree

## Data workflow

Run `bun run sync`, then `bun run normalize` when updating the source data.
Downloaded files under `data/raw/**` are intentionally ignored. The normalized
files under `data/processed/**` are the deployed application dataset and should
remain tracked. The application reads only ranked `dia` snapshots for leagues
1–8; the separate popularity and granular Master-tier endpoints are not part of
the first release.

The UI calls the server through oRPC, so browsers receive only the compact
result for the active view rather than the complete snapshot collection.
“Matchup average” means an unweighted mean of reported matchup win rates, and
“reporting period” is the canonical time label.

`src/components/ui/` is formatted by oxfmt but excluded from oxlint (shadcn-managed components).
