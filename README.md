# Pokedex Team Builder

Browse the National Pokedex, pick a team of six, and get told where that team
breaks: which attacking types most of the roster folds to, and which types it has
no way to hit back.

> **Live demo:** _add your deployment URL here_

<!-- Add screenshots here: the dex grid, and the resistance matrix in both themes -->

![React](https://img.shields.io/badge/React-18-149ECA)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154)
![Tests](https://img.shields.io/badge/tests-51%20passing-0F6E6E)

---

## Why a Pokedex needed a reason to exist

A Pokedex is the most common portfolio project there is, and for good reason: it
is a clean API, it looks nice, and it is mostly a matter of moving JSON onto the
screen. That last part is also the problem. There is no decision in it that a
reviewer can find interesting, because there is no decision in it at all.

So this one carries a second half. Picking a team is where Pokemon actually gets
computational, and the maths is real:

**Type effectiveness compounds across a dual typing.** Rock is super effective on
both Fire and Flying, so a Charizard takes not double but **quadruple** damage.
Ground doubles against Fire, but nothing on the ground touches a Flying type at
all, so the same Charizard takes **zero**. Multipliers multiply, and that single
fact is what makes team composition a puzzle rather than a shopping list.

The app runs that calculation across the whole roster in two directions:

| | Question it answers |
| --- | --- |
| **Resistance matrix** | For each of the 18 attacking types, how many of your six fold to it, and what is the worst single hit |
| **Coverage report** | Which of the 18 types nobody on the team can hit for extra damage |

A weakness held by one member is an inconvenience. One shared by half the roster
decides matches, so it is reported separately and stated in a sentence above the
grid rather than left for the reader to count.

### An assumption, stated out loud

Offensive coverage treats each Pokemon as attacking with its own types. PokeAPI
can list every move a species learns, but a real moveset is four slots chosen by
a player, and guessing it would make the output look precise while being
invented. Same-type attacks are the one assumption that holds for almost any
build. The app says so on the page itself rather than burying it in a footnote.

---

## Design

Most Pokedexes reach for the yellow and red of the packaging and then colour all
eighteen types at full saturation, which leaves nothing able to stand out. This
one treats the Pokedex as what it is in the fiction: **a field instrument for
classifying species**. Cool laboratory paper, plotter blue, catalogue numbers set
in mono because they are real identifiers people search by.

Type colour is confined to the chips. The analysis views use a diverging scale
instead, warm for damage taken and cool for damage resisted, so that in the
matrix colour means severity and nothing else. Reading a vertical stripe of warm
cells and knowing instantly that the whole team shares a hole is the entire point
of the view, and eighteen competing hues would destroy it.

---

## What was wrong with the first version

This started as a Create React App project written early on. Rewriting it fixed
real defects, not just the stack:

| Defect | What happened |
| --- | --- |
| **Race condition on paging** | Nothing cancelled in-flight requests, so a slow response for page 2 could land after page 3 and overwrite it. Requests are now keyed and deduplicated by TanStack Query |
| **21 requests per page, every time** | Paging back to a screen already visited refetched all of it. Species data never changes, so it is now cached for the life of the tab |
| **Detail page ignored its own id** | The fetch ran in an effect with an empty dependency array, so the page kept whichever Pokemon it loaded first |
| **Stale image on recycled cards** | The loader never reset when `src` changed, so a card briefly showed the previous Pokemon |
| **Desktop layout never applied** | `md:-flex-row` has a stray hyphen, so it was not a Tailwind class and was silently ignored |
| **Controlled input warning** | Search state started as `null`, which React treats as uncontrolled until the first keystroke |
| **Missing React keys** | Type chips were rendered from `.map()` without one, in two places |
| **`alert()` for errors** | A blocking browser dialog for a mistyped search, which is a normal outcome and not a failure |

---

## Tech stack

| Layer | Choice | Reasoning |
| --- | --- | --- |
| Build | Vite 5 | |
| Language | TypeScript 5.6 (`strict`) | Including `noUncheckedIndexedAccess` |
| Server state | TanStack Query | Caching, deduplication, and request keying, which is what removes the race condition rather than patching it |
| Client state | Zustand | The only client state is six Pokemon. Redux would mean a store, a slice, and middleware around one array |
| Styling | Tailwind CSS | Design tokens as CSS variables, so dark mode swaps one block |
| Components | shadcn/ui on Radix | Copied into `src/components/ui` and owned outright |
| Tests | Vitest and Testing Library | |

### Why the type chart is data, not an API call

PokeAPI serves damage relations per type, but the chart has not changed since
generation 6. Fetching it would mean 18 requests before a single calculation
could run, and would make the whole analysis impossible to test without a
network. It lives in [`typeChart.ts`](src/domain/typeChart.ts) with only the
non-neutral entries listed, which keeps it short enough to actually check against
a reference.

### Why dex pages are arithmetic

Dex ids are sequential, so page 3 is ids 49 to 72 and no index request is needed
to work that out. That removes a request from every page turn, and more usefully
removes a dependency: the detail queries start immediately instead of waiting on
a list response.

---

## Architecture notes

**The domain layer knows nothing about React or the network.**
[`src/domain`](src/domain) is plain functions over plain data, which is why 43 of
the 51 tests need no mocking, no rendering, and no fixtures beyond a few objects.

**The API boundary narrows the payload.** [`pokeapi.ts`](src/api/pokeapi.ts)
converts PokeAPI's response into the app's own shape once, so the rest of the
code never handles their field names and the analysis can rely on a type being
one of eighteen known values rather than any string the API returns.

**The roster stores four fields per Pokemon.** It is persisted to localStorage,
so keeping the full payload would put stats, abilities, and every sprite variant
on disk for six Pokemon that need a name, a typing, and one image.

**Failed adds report why.** Adding to a full team returns `'full'` rather than
silently doing nothing, so the interface can say what happened instead of leaving
the user to wonder whether the button works.

---

## Running locally

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
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Single test run |
| `npm run lint` | ESLint |

---

## Tests

```
Test Files  3 passed
Tests      51 passed
```

Weighted toward the maths rather than the markup: every immunity in the chart,
multipliers compounding across dual types, threat counts and their tie-breaking,
coverage gaps pinned to an exact list, and the roster rules around duplicates and
the six-slot cap.

---

## Known limitations

- Coverage assumes same-type attacks, as described above.
- The dex stops at the 1025 numbered species. Alternate forms are numbered from
  10001 by PokeAPI and have no dex entry of their own.
- Teams are per-device. There is no account and no sync.

---

Species data from [PokeAPI](https://pokeapi.co).
Built by [Khahlil Gibran Hadi](https://github.com/lilgibs).
