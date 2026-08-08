# SF6 Ranked Lab

A compact, data-first TanStack Start workbench for ranked Street Fighter 6
matchup analysis. It serves committed Buckler battle-diagram snapshots through
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
- `bun run sync` — download missing raw snapshots for all four Buckler data families and check for new periods
- `bun run normalize` — deterministically regenerate every processed snapshot from local raw data
- `bun run format` — format with oxfmt
- `bun run lint` — lint with oxlint (type-aware, with fixes)
- `bun run check` — format, lint (with fixes), and type-check
- `bun test` — run focused regression tests
- `bun run routes:generate` — regenerate the route tree

## Data workflow

Run `bun run sync`, then `bun run normalize` when updating the source data.
Both commands cover `dia`, `dia_master`, `usagerate`, and `usagerate_master`.
Downloaded files under `data/raw/**` are intentionally ignored. The normalized
files under `data/processed/**` remain tracked historical data. The application
reads ranked `dia` snapshots for Rookie through All Master and processed
`dia_master` snapshots for Master, High Master, Grand Master, and Ultimate
Master. Master subdivision results combine all control styles. The
`usagerate` and `usagerate_master` archives remain outside the active matchup
UI, but all four processed families must contain a period before that period
is advertised as the latest available data. Older history remains available;
the common-period watermark only caps the newest advertised period. Processed
matchup files that arrive before usage-rate files remain stored and become
active automatically when the lagging families catch up.

## Workbench sections

- **Roster** — the full leaderboard and the transparent Classic/Modern player-control comparison.
- **Matchups** — reported head-to-head results, control-pairing results, best/worst opponent lists, and the counterpick planner.
- **Comparisons** — character trends, rank progression, and reporting-period comparison.

Each section owns its URL search state. Compatible period, rank, character,
opponent, control, and selected-opponent choices are carried between links without
introducing a global filter bar. Controls remain rendered in a stable toolbar
while result data is pending or unavailable.

The UI calls the server through oRPC, so browsers receive only the compact
result for the active view rather than the complete snapshot collection.
“Average win rate” means an unweighted mean of reported win rates against
available opponents. The UI displays reporting periods as month and year
labels such as `Jul 2026`; the canonical data key remains `YYYYMM`. Missing
values remain `—` and are not converted into zeroes.

`src/components/ui/` is formatted by oxfmt but excluded from oxlint (shadcn-managed components).
