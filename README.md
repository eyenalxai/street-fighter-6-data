# SF6 Ranked Lab

A compact, data-first TanStack Start workbench for ranked Street Fighter 6
meta, usage, and matchup analysis. It serves committed Buckler snapshots through
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
files under `data/processed/**` remain tracked historical data.

The application reads ranked `dia` snapshots for Rookie through All Master and
processed `dia_master` snapshots for Master, High Master, Grand Master, and
Ultimate Master. `usagerate` and `usagerate_master` provide character usage
shares for the same rank/control populations. Master subdivision usage and
matchup results combine all control styles. All four processed families must
contain a period before that period is advertised as the latest complete data.
Older history remains available; the common-period watermark only caps the
newest advertised period.

## Workbench sections

- **Roster** — average win rate/popularity snapshots, control-style differences, and environment landscape.
- **Characters** — selected-character average win rate, popularity, rank progression, persistence, and stability.
- **Matchups** — complete matchup profiles, control-pairing results, pair progression, profile similarity, and counterpick planning.
- **Changes** — period-to-period average win rate, popularity, diversity, balance, matchup flips, and persistence.

Each section owns its URL search state. Compatible period, rank, character,
opponent, control, and selected-opponent choices are carried between links
without introducing a global filter bar. Controls remain rendered in a stable
toolbar while result data is pending or unavailable.

The UI calls the server through oRPC, so browsers receive only the compact
result for the active view rather than the complete snapshot collection.
“Average win rate” means an unweighted mean of reported win rates against
available opponents. Popularity-weighted metrics use opponent usage share and
renormalize over the available weighted cells; they do not represent match
volume. Weighted disadvantage contribution is a percentage-point contribution
from each reported opponent's positive deficit, normalized over the reported
opponent usage weight. Usage share is a character share of the selected
population, while effective roster size is the exponential Shannon entropy of
those shares. Snapshot and Over Time modes use the selected player-control
population; Landscape and Across Ranks use combined controls; control
comparison modes compare both styles. Change Explorer's matchup results follow
the selected player-control scope and display the individual control pairings.
Persistence charts show the full available history, with the selected
comparison periods marked. The UI displays reporting periods as month and year
labels such as `Jul 2026`; the canonical data key remains `YYYYMM`. Missing
values remain `—` and are not converted into zeroes.

`src/components/ui/` is formatted by oxfmt but excluded from oxlint
(shadcn-managed components).
