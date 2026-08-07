# Street Fighter 6 Data

Raw ranked-match statistics published by Capcom's Buckler's Boot Camp stats pages.

## Language

**Reporting period**:
A calendar month of published stats, keyed as `YYYYMM`.
_Avoid_: date, month filter

**Dataset**:
One of the four Buckler stats API endpoints: `usagerate`, `dia`, `usagerate_master`, or `dia_master`.
_Avoid_: page, tab

**Ranked stats**:
Stats across ranked leagues 1–8, plus league 0 (All ranks combined).
_Avoid_: normal stats

**Master stats**:
Stats for Master-tier leagues (36, 40, 41, 42). The `_master` suffix on API paths denotes this tier, not a separate version of the data.
_Avoid_: master version, master copy

**Control view**:
How usage or diagram data splits Classic vs Modern. This is a dimension inside the API JSON, not a separate download.
_Avoid_: control filter URL

**Snapshot**:
One raw JSON file for one dataset and one reporting period.
_Avoid_: export, dump
