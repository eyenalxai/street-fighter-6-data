# Street Fighter 6 Data

Ranked Street Fighter 6 matchup analytics built from Capcom's Buckler's Boot Camp
battle-diagram snapshots.

## Language

**Reporting period**:
A calendar month of published stats, keyed as `YYYYMM`.
The UI presents it as a month and year, such as `Jul 2026`.

**Ranked snapshot**:
One processed matchup JSON file for one reporting period. Standard ranks run from
Rookie through Diamond, and **All Master** is the complete reported Master
population.

**Average win rate**:
The unweighted mean of the available reported matchup win rates for a character,
calculated from normalized source precision. Unavailable and mirror cells are
excluded; one-decimal rounding is presentation-only.

**Control matchup**:
One validated pair of player and opponent controls: All control styles, Classic
player / Classic opponent, Classic player / Modern opponent, Modern player /
Classic opponent, or Modern player / Modern opponent. The application does not
approximate unsupported combinations.

**Rank**:
A standard rank from Rookie through Diamond, All Master, or one Master
subdivision: Master, High Master, Grand Master, or Ultimate Master.

**All Master**:
The reported result for the complete Master population. It is distinct from the
four Master subdivisions.

**Master subdivision**:
One of Master, High Master, Grand Master, or Ultimate Master. Subdivision
results combine all control styles.

**Reported matchup win rate**:
One reported player/opponent result for one ranked league and one control
pairing. A missing result is unavailable; a same-character result with matching
controls is a mirror matchup.

**Player-control average**:
The average of both required control-pairing win rates for one player's control:
Classic averages Classic player / Classic opponent and Classic player / Modern
opponent; Modern averages Modern player / Classic opponent and Modern player /
Modern opponent. If either required pairing is unavailable, the average is
unavailable.

**Weighted disadvantage contribution**:
The positive matchup deficit, `max(0, 50 - win rate)`, multiplied by the
opponent's share of the usage weight among numeric reported matchup cells. It
is measured in percentage points and does not represent match volume.

**Counterpick candidate result**:
A counterpick planner result evaluated against a unique selected opponent set.
A candidate is ranked only when every selected opponent has a reported result.
“Opponents at or above 50%” counts complete candidate-versus-opponent results at
or above 50%.

**Latest complete reporting period**:
The newest reporting period represented by every retained processed snapshot
family. It caps the periods advertised by the application while retained
ahead-of-watermark snapshots remain stored.

**Period comparison**:
The comparison view between two reporting periods. Its change is the later
period's average win rate minus the earlier period's average win rate.

**Analysis control scope**:
Snapshot and Over Time views use the selected player-control population.
Landscape and Across Ranks use combined controls so their rank and historical
comparisons remain comparable. Control comparison views include both Classic
and Modern populations. Change Explorer applies the selected player-control
scope to its matchup summaries and reports individual control pairings.

**Persistence history**:
Change Explorer shows every available period for the selected rank and control
scope. The selected comparison endpoints are marked within that history; later
movement is visible only when later snapshots exist.

**Snapshot storage**:
Raw downloads remain in ignored `data/raw/**`. Deterministically normalized
snapshots under `data/processed/**` are committed historical data. Active
analytics reads all four retained families: `dia` and `dia_master` provide
reported matchup cells, while `usagerate` and `usagerate_master` provide
character usage shares. Usage `ot=0`, `ot=1`, and `ot=2` mean all control styles,
Classic players, and Modern players respectively. Master subdivision usage does
not separate control styles and is therefore exposed as combined only. All four
family inventories determine the latest complete reporting period. Every
snapshot family is validated with Zod before analytics uses it, and
popularity-weighted metrics are estimates based on usage share rather than
match volume.
