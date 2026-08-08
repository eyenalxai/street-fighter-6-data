# Street Fighter 6 Data

Ranked Street Fighter 6 matchup analytics built from Capcom's Buckler's Boot Camp
battle-diagram snapshots.

## Language

**Reporting period**:
A calendar month of published stats, keyed as `YYYYMM`.
The UI presents it as a month and year, such as `Jul 2026`.

**Ranked snapshot**:
One processed `dia` JSON file for one reporting period. The first release uses
ranked leagues 1–8 only. In the UI, **Master** means ranked league 8.

**Average win rate**:
The unweighted mean of the available reported matchup win rates for a character.
Unavailable and mirror cells are excluded.

**Control matchup**:
One validated pair of player and opponent controls: All control styles, Classic
player / Classic opponent, Classic player / Modern opponent, Modern player /
Classic opponent, or Modern player / Modern opponent. The application does not
approximate unsupported combinations.

**Rank**:
One of Buckler's ranked leagues 1–8. In the UI, Master means league 8.

**Reported matchup win rate**:
One reported player/opponent result for one ranked league and one control
pairing. A missing result is unavailable; a same-character result with matching
controls is a mirror matchup.

**Player-control average**:
The average of the two control-pairing win rates for one player's control:
Classic averages Classic player / Classic opponent and Classic player / Modern
opponent; Modern averages Modern player / Classic opponent and Modern player /
Modern opponent.

**Counterpick candidate result**:
A counterpick planner result evaluated against the selected opponent set.
“Opponents at or above 50%” counts candidate-versus-opponent results at or
above 50%.

**Period comparison**:
The comparison view between two reporting periods. Its change is the later
period's average win rate minus the earlier period's average win rate.

**Snapshot storage**:
Raw downloads remain in ignored `data/raw/**`. Deterministically normalized
snapshots under `data/processed/**` are committed historical data. The active
application reads `data/processed/dia/**`; all retained archives are validated
with Zod at the server boundary before any analytics uses them.
