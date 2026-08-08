# SF6 Ranked Data

SF6 Ranked Data is a web application for Street Fighter 6 ranked statistics.
Use it to view character use rates, win rates, and matchups. The application
uses monthly data.

## Data source

The data comes from the official
[Buckler's Boot Camp](https://www.streetfighter.com/6/buckler/en/stats/dia)
website from Capcom. Buckler publishes monthly combined statistics. This
project does not collect individual match records. This project is not an
official Capcom project.

The project uses these four Buckler data sets:

- `dia`: Matchup data for Rookie through All Master.
- `dia_master`: Matchup data for the four Master rank groups.
- `usagerate`: Character use data for Rookie through All Master.
- `usagerate_master`: Character use data for the four Master rank groups.

The reporting period has the `YYYYMM` format. For example, `202607` means July 2026.

## Start the application

Install [Bun](https://bun.sh/). Then, run these commands:

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

To start a production build, run these commands:

```bash
bun run build
bun run start
```

## Get the data

The repository contains the processed data in `data/processed/`. You can use
this data after you clone the repository.

To get the source data from Buckler, run:

```bash
bun run sync
```

This command does these steps:

1. It makes a request to the Buckler JSON API for each reporting period.
2. It downloads only files that are not in `data/raw/`.
3. It waits between requests and retries temporary request errors.
4. It stores the API responses in `data/raw/`.

The command checks standard-rank data from June 2023. It checks Master-group
data from February 2025. It stops before the current reporting period. You do
not need an API key.

The `data/raw/` directory is not part of the Git repository. To convert the raw
files to the smaller format that the application uses, run:

```bash
bun run normalize
```

Run `bun run sync` before `bun run normalize` when you want new data.

## Get one file manually

Buckler uses this API URL:

```text
https://www.streetfighter.com/6/buckler/api/en/stats/{data-set}/{YYYYMM}
```

Replace `{data-set}` with one of the four data set names in this document.
Replace `{YYYYMM}` with the required reporting period.

For example, use this command to get the standard-rank matchup data for July
2026:

```bash
curl 'https://www.streetfighter.com/6/buckler/api/en/stats/dia/202607' \
  -H 'Accept: application/json' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
  -H 'Referer: https://www.streetfighter.com/6/buckler/en/stats/dia/202607' \
  --output 202607.json
```

Buckler can reject a request that does not have a browser user agent and a
valid Buckler referrer. Buckler can also reject a period that is not available.
