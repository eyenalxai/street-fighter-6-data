# Street Fighter 6 Data

Ranked Street Fighter 6 matchup analytics built from Capcom's Buckler's Boot Camp
battle-diagram snapshots.

## Language

**Reporting period**:
A calendar month of published stats, keyed as `YYYYMM`.
Avoid calling this a date.

**Ranked snapshot**:
One processed `dia` JSON file for one reporting period. The first release uses
ranked leagues 1–8 only. In the UI, **Master** means ranked league 8; it does
not mean the separate `dia_master` endpoint.

**Matchup average**:
The unweighted mean of the available reported matchup win rates for a character.
Unavailable and mirror cells are excluded.

**Control matchup**:
One validated pair of player and opponent controls: Combined, Classic vs
Classic, Classic vs Modern, Modern vs Classic, or Modern vs Modern. The
application does not approximate unsupported All-vs-specific combinations.

**Period Compare**:
The comparison view between two reporting periods. Use this term instead of
Date Compare.

**Snapshot storage**:
Raw downloads remain in ignored `data/raw/**`. Deterministically normalized
`data/processed/**` snapshots are committed application data and are validated
with Zod at the server boundary before analytics runs.
