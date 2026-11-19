# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/aixinnongnong/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/aixinnongnong/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline GTA VI trophy guide and tracker for PlayStation 5. All 55 official trophies with a guide for every one, written in our own words from the official descriptions; a four-phase platinum roadmap; missable flags with save-or-replay notes; and a checklist that saves itself in the browser, with export and import, filters by grade and kind, a spoiler-safe mode that hides story trophies until earned, and per-grade progress counts. Everything runs in the browser — no network, no account, no ads.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` from a static file server. The app is plain static files (`app/index.html`, `app/app.js`, `app/style.css`, `app/data/trophies.json`) with vendored fonts — it makes no network requests.

## What is inside

- `app/data/trophies.json` — the 55 official trophies (names, descriptions and grades exactly as on the official PS5 list), each with an original guide, a kind (story / side strand / activity / collectible / combat / misc), a missable flag and cited sources.
- `app/app.js` — the tracker: saved checklist, export/import, search, grade/kind filters, spoiler mode, sort, progress bar and the roadmap.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

## About this guide

Trophy names, descriptions and grades are the official PlayStation 5 list. Every guide is written in our own words — nothing is copied from another guide. Sources are cited on each trophy (official PS5 trophy list, PSNProfiles, Exophase, PowerPyx). An unofficial fan guide, not affiliated with Rockstar Games or PlayStation; no Rockstar artwork or logos are used.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xhh2wh2q&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
