import { describe, it, expect, beforeEach } from 'vitest';
import { useTeamStore } from './teamStore';
import { MAX_TEAM_SIZE, type PokemonType, type TeamMember } from '../domain/types';

const member = (id: number, name = `pokemon-${id}`, types: PokemonType[] = ['normal']): TeamMember => ({
  id,
  name,
  types,
  spriteUrl: null,
});

const store = () => useTeamStore.getState();

beforeEach(() => {
  useTeamStore.setState({ team: [] });
});

describe('team roster', () => {
  it('adds a Pokemon', () => {
    expect(store().add(member(25, 'pikachu'))).toBe('added');
    expect(store().team.map((entry) => entry.name)).toEqual(['pikachu']);
  });

  it('keeps the order Pokemon were added in', () => {
    store().add(member(1));
    store().add(member(2));
    store().add(member(3));
    expect(store().team.map((entry) => entry.id)).toEqual([1, 2, 3]);
  });

  // The caller needs to know why nothing happened, or the button just looks broken.
  it('refuses a duplicate and says so', () => {
    store().add(member(25));
    expect(store().add(member(25))).toBe('duplicate');
    expect(store().team).toHaveLength(1);
  });

  it('refuses to go past six and says so', () => {
    for (let id = 1; id <= MAX_TEAM_SIZE; id += 1) store().add(member(id));
    expect(store().add(member(99))).toBe('full');
    expect(store().team).toHaveLength(MAX_TEAM_SIZE);
  });

  it('removes by id and leaves the rest alone', () => {
    store().add(member(1));
    store().add(member(2));
    store().remove(1);
    expect(store().team.map((entry) => entry.id)).toEqual([2]);
  });

  it('ignores a removal for a Pokemon that is not on the team', () => {
    store().add(member(1));
    store().remove(999);
    expect(store().team).toHaveLength(1);
  });

  it('frees a slot once a Pokemon is removed', () => {
    for (let id = 1; id <= MAX_TEAM_SIZE; id += 1) store().add(member(id));
    store().remove(1);
    expect(store().add(member(99))).toBe('added');
  });

  it('empties the roster', () => {
    store().add(member(1));
    store().add(member(2));
    store().clear();
    expect(store().team).toEqual([]);
  });
});
