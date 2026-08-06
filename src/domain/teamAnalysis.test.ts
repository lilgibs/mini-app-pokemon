import { describe, it, expect } from 'vitest';
import {
  defensiveThreats,
  rankedThreats,
  coverageGaps,
  offensiveCoverage,
  summarizeTeam,
} from './teamAnalysis';
import { POKEMON_TYPES, type PokemonType, type TeamMember } from './types';

const member = (name: string, types: PokemonType[], id = 1): TeamMember => ({
  id,
  name,
  types,
  spriteUrl: null,
});

const charizard = member('charizard', ['fire', 'flying'], 6);
const blastoise = member('blastoise', ['water'], 9);
const venusaur = member('venusaur', ['grass', 'poison'], 3);
const pikachu = member('pikachu', ['electric'], 25);

const starters = [charizard, blastoise, venusaur, pikachu];

const threatFor = (team: readonly TeamMember[], type: PokemonType) =>
  defensiveThreats(team).find((row) => row.type === type);

describe('defensiveThreats', () => {
  it('reports a row for every type, even ones nothing is weak to', () => {
    expect(defensiveThreats(starters)).toHaveLength(POKEMON_TYPES.length);
  });

  it('counts how many members fold to an attacking type', () => {
    // Electric doubles on Charizard through Flying and on Blastoise through
    // Water, while Venusaur and Pikachu both resist it.
    expect(threatFor(starters, 'electric')).toMatchObject({ weakTo: 2, resists: 2 });
  });

  // Reporting only an average would hide this: one member taking 4x is a
  // different problem from two members taking 2x.
  it('keeps the worst single multiplier visible', () => {
    expect(threatFor(starters, 'rock')).toMatchObject({ weakTo: 1, maxMultiplier: 4 });
  });

  it('counts an immunity as a resistance', () => {
    // Ground cannot touch Charizard, doubles on Pikachu, and is neutral on the
    // other two.
    expect(threatFor(starters, 'ground')).toMatchObject({ weakTo: 1, resists: 1 });
  });

  it('reports zeros for an empty team rather than failing', () => {
    expect(threatFor([], 'fire')).toEqual({
      type: 'fire',
      weakTo: 0,
      resists: 0,
      maxMultiplier: 0,
    });
  });
});

describe('rankedThreats', () => {
  it('drops types nobody on the team is weak to', () => {
    // Nothing in this team is weak to Fairy.
    expect(rankedThreats(starters).map((row) => row.type)).not.toContain('fairy');
  });

  it('puts the type that hits the most members first', () => {
    expect(rankedThreats(starters)[0]).toMatchObject({ type: 'electric', weakTo: 2 });
  });

  // With the counts level, the heavier hit is the more urgent one.
  it('breaks a tie on the worst multiplier', () => {
    const ranked = rankedThreats(starters).filter((row) => row.weakTo === 1);
    expect(ranked[0]).toMatchObject({ type: 'rock', maxMultiplier: 4 });
  });

  it('returns nothing for an empty team', () => {
    expect(rankedThreats([])).toEqual([]);
  });
});

describe('offensiveCoverage', () => {
  it('names the members that can hit a type hard', () => {
    const row = offensiveCoverage(starters).find((entry) => entry.type === 'water');
    // Venusaur through Grass, Pikachu through Electric.
    expect(row?.coveredBy).toEqual(['venusaur', 'pikachu']);
  });

  it('leaves a type uncovered when the whole team is resisted', () => {
    const row = offensiveCoverage(starters).find((entry) => entry.type === 'dragon');
    expect(row?.coveredBy).toEqual([]);
  });
});

describe('coverageGaps', () => {
  // This is the headline number the team page reports, so it is pinned exactly.
  it('lists every type the team cannot hit for extra damage', () => {
    expect(coverageGaps(starters)).toEqual([
      'normal',
      'electric',
      'poison',
      'psychic',
      'ghost',
      'dragon',
      'dark',
    ]);
  });

  it('closes a gap once a member covers it', () => {
    // Fighting doubles on Normal and on Dark.
    const withMachamp = [...starters, member('machamp', ['fighting'], 68)];
    expect(coverageGaps(withMachamp)).not.toContain('normal');
    expect(coverageGaps(withMachamp)).not.toContain('dark');
  });

  it('treats an empty team as covering nothing', () => {
    expect(coverageGaps([])).toHaveLength(POKEMON_TYPES.length);
  });
});

describe('summarizeTeam', () => {
  it('flags a weakness shared by at least half the team', () => {
    // Both members fold to Electric, so it is structural rather than incidental.
    const summary = summarizeTeam([charizard, blastoise]);
    expect(summary.sharedWeaknesses.map((row) => row.type)).toContain('electric');
  });

  it('leaves a weakness held by one member out of the shared list', () => {
    const summary = summarizeTeam(starters);
    // Rock only hits Charizard, one of four.
    expect(summary.sharedWeaknesses.map((row) => row.type)).not.toContain('rock');
    expect(summary.threats.map((row) => row.type)).toContain('rock');
  });

  it('counts covered types out of eighteen', () => {
    expect(summarizeTeam(starters).typesCovered).toBe(POKEMON_TYPES.length - 7);
  });

  // An empty team divides by nothing and must not report every type as a
  // shared weakness through a zero-length comparison.
  it('stays quiet for an empty team', () => {
    const summary = summarizeTeam([]);
    expect(summary.sharedWeaknesses).toEqual([]);
    expect(summary.threats).toEqual([]);
    expect(summary.typesCovered).toBe(0);
  });
});
