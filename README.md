# 🔴 Pokedex Team Builder

Browse the National Pokedex, pick a team of six, and find out where that team
breaks: which attacking types most of your roster folds to, and which types it
has no way to hit back.

> 🌐 **Live demo:** _add your deployment URL here_

<!-- Add screenshots here: the dex grid, and the resistance matrix in both themes -->

![React](https://img.shields.io/badge/React-18-149ECA)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154)
![Tests](https://img.shields.io/badge/tests-51%20passing-0F6E6E)

---

## 🌟 What it does

**🔍 Browse and search.** All 1025 numbered species, filterable by any of the
eighteen types, searchable by name.

**📊 Inspect a species.** Base stats, abilities, height and weight, and a full
list of what it takes extra or reduced damage from.

**⚔️ Build a team of six** from anywhere in the app, and keep it between visits.

**🛡️ See where the team breaks.** Two readouts, updated as the roster changes:

| Readout | What it tells you |
| --- | --- |
| **Resistance matrix** | For each of the eighteen attacking types, how many of your six take extra damage, and the worst single hit anyone takes |
| **Coverage report** | Which types nobody on the team can hit for extra damage |

A weakness one member has is an inconvenience. One that half the roster shares
decides matches, so those are called out separately in a sentence above the grid.

---

## 🧭 Reading the matrix

Rows are your team, columns are the eighteen attacking types, and each cell is
the damage multiplier that member takes. Warm cells mean extra damage, cool cells
mean resisted or immune, and neutral is left blank so the grid only draws
attention where something is actually happening.

```
              NOR FIR WAT ELE GRA ICE FIG POI GRO FLY ...
  Charizard        1/2 2   2   1/4         2   0
  Blastoise        1/2 1/2 2   2   1/2
  Venusaur         2   1/2 1/2 1/4 2   1/2 1/2
  Pikachu                  1/2                 2
  ─────────────────────────────────────────────────────
  weak         0   1   1   2   1   1   0   0   1   0
```

The bottom row is the count that matters. A vertical stripe of warm cells means
the whole team shares a hole.

**Multipliers compound across a dual typing**, which is what makes team building
a puzzle rather than a shopping list. Rock is super effective against both Fire
and Flying, so a Charizard takes **quadruple** damage from it. Ground doubles
against Fire, but nothing on the ground touches a Flying type at all, so the same
Charizard takes **zero**.

### 📐 What coverage assumes

Coverage treats each Pokemon as attacking with its own types. PokeAPI can list
every move a species learns, but a real moveset is four slots chosen by a player,
so anything more specific would be guesswork presented as data. Read the coverage
number as what a roster has before any move is picked. The app states this on the
page as well.

---

## 🎨 Design

The Pokedex is treated as what it is in the fiction: a field instrument for
classifying species. Cool laboratory paper, plotter blue, and catalogue numbers
set in monospace because they are real identifiers people search by.

Type colour appears only on the chips. The analysis views use a diverging scale
instead, warm for damage taken and cool for damage resisted, so that inside the
matrix colour means severity and nothing else. Spotting a warm stripe and knowing
instantly that the team shares a weakness is the whole point of the view, and
eighteen competing hues would bury it.

---

## 🛠 Tech stack

| Layer | Choice | Reasoning |
| --- | --- | --- |
| Build | Vite 5 | |
| Language | TypeScript 5.6 (`strict`) | Including `noUncheckedIndexedAccess` |
| Server state | TanStack Query | Caching, deduplication, and request keying |
| Client state | Zustand | The only client state is six Pokemon, which does not need a store, a slice, and middleware around it |
| Styling | Tailwind CSS | Design tokens as CSS variables, so dark mode swaps one block |
| Components | shadcn/ui on Radix | Copied into `src/components/ui` and owned outright |
| Tests | Vitest and Testing Library | |

---

## ⚙️ How it works

**The domain layer knows nothing about React or the network.**
[`src/domain`](src/domain) is plain functions over plain data, which is why 43 of
the 51 tests need no mocking, no rendering, and no fixtures beyond a few objects.

**The type chart is data, not an API call.** PokeAPI serves damage relations per
type, but the chart has not changed since generation 6. Fetching it would mean
eighteen requests before a single calculation could run, and would make the
analysis impossible to test without a network. It lives in
[`typeChart.ts`](src/domain/typeChart.ts) with only the non-neutral entries
listed, short enough to check against a reference.

**Dex pages are arithmetic.** Ids are sequential, so page 3 is ids 49 to 72 and
no index request is needed to work that out. Detail queries start immediately
rather than waiting on a list response.

**Species data is cached for the life of the tab.** Nothing about a Pokemon
changes, so paging back to a screen already visited costs nothing, and opening a
detail page is instant because that query resolved while the card was on screen.

**The API boundary narrows the payload.** [`pokeapi.ts`](src/api/pokeapi.ts)
converts PokeAPI's response into the app's own shape once, so the rest of the
code never handles their field names, and the analysis can rely on a type being
one of eighteen known values rather than any string the API returns.

**The roster stores four fields per Pokemon.** It is persisted to localStorage,
so keeping the full payload would put stats, abilities, and every sprite variant
on disk for six Pokemon that need a name, a typing, and one image.

---

## 🚀 Running locally

```bash
git clone https://github.com/lilgibs/mini-app-pokemon.git
cd mini-app-pokemon
npm install
npm run dev
```

Open <http://localhost:3000>. There is no API key and no configuration.

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check, then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Single test run |
| `npm run lint` | ESLint |

---

## 🧪 Tests

```
Test Files  3 passed
Tests      51 passed
```

Weighted toward the maths rather than the markup: every immunity in the chart,
multipliers compounding across dual types, threat counts and their tie-breaking,
coverage gaps pinned to an exact list, and the roster rules around duplicates and
the six-slot cap.

---

## ⚠️ Known limitations

- Coverage assumes same-type attacks, as described above.
- The dex stops at the 1025 numbered species. Alternate forms are numbered from
  10001 by PokeAPI and have no dex entry of their own.
- Teams are per-device. There is no account and no sync.

---

Species data from [PokeAPI](https://pokeapi.co).
Built by [Khahlil Gibran Hadi](https://github.com/lilgibs).
