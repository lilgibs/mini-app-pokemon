import { describe, it, expect } from 'vitest';
import { effectiveness, effectivenessAgainst } from './typeChart';
import { POKEMON_TYPES } from './types';

describe('effectiveness', () => {
  it('returns neutral damage for a pairing with no entry', () => {
    expect(effectiveness('normal', 'normal')).toBe(1);
  });

  it.each([
    ['fire', 'grass', 2],
    ['water', 'fire', 2],
    ['grass', 'water', 2],
    ['fighting', 'normal', 2],
    ['fairy', 'dragon', 2],
    ['steel', 'fairy', 2],
  ] as const)('%s hits %s for %sx', (attacker, defender, expected) => {
    expect(effectiveness(attacker, defender)).toBe(expected);
  });

  it.each([
    ['fire', 'water', 0.5],
    ['grass', 'steel', 0.5],
    ['dragon', 'steel', 0.5],
  ] as const)('%s is resisted by %s at %sx', (attacker, defender, expected) => {
    expect(effectiveness(attacker, defender)).toBe(expected);
  });

  // The immunities are the entries most often missed when a chart is typed out
  // by hand, and each one silently breaks the analysis in a different place.
  it.each([
    ['normal', 'ghost'],
    ['ghost', 'normal'],
    ['electric', 'ground'],
    ['ground', 'flying'],
    ['fighting', 'ghost'],
    ['poison', 'steel'],
    ['psychic', 'dark'],
    ['dragon', 'fairy'],
  ] as const)('%s cannot touch %s', (attacker, defender) => {
    expect(effectiveness(attacker, defender)).toBe(0);
  });

  it('only ever returns 0, 0.5, 1, or 2', () => {
    const seen = new Set<number>();
    for (const attacker of POKEMON_TYPES) {
      for (const defender of POKEMON_TYPES) seen.add(effectiveness(attacker, defender));
    }
    expect([...seen].sort()).toEqual([0, 0.5, 1, 2]);
  });
});

describe('effectivenessAgainst', () => {
  it('treats a single type the same as a direct lookup', () => {
    expect(effectivenessAgainst('water', ['fire'])).toBe(2);
  });

  // Multipliers multiply rather than add, which is what puts the extremes so
  // far apart and makes dual typing worth modelling at all.
  it('stacks both halves of a dual type', () => {
    // Rock is super effective on Fire and on Flying, so Charizard takes 4x.
    expect(effectivenessAgainst('rock', ['fire', 'flying'])).toBe(4);
  });

  it('cancels a weakness against a resistance', () => {
    // Ground doubles on Poison but halves on Grass, so Venusaur takes neutral.
    expect(effectivenessAgainst('ground', ['grass', 'poison'])).toBe(1);
  });

  it('lets an immunity override a weakness on the other half', () => {
    // Ground doubles on Fire, but nothing on the ground touches a Flying type.
    expect(effectivenessAgainst('ground', ['fire', 'flying'])).toBe(0);
  });

  it('stacks two resistances into a quarter', () => {
    expect(effectivenessAgainst('grass', ['fire', 'flying'])).toBe(0.25);
  });

  it('returns neutral damage against an empty typing', () => {
    expect(effectivenessAgainst('fire', [])).toBe(1);
  });
});
