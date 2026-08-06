export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

/**
 * A team is capped at six, the same as the games.
 *
 * The cap is not decoration. Coverage analysis only says something useful when
 * the roster is finite: with unlimited slots every gap can be patched, and the
 * trade-offs the tool exists to surface disappear.
 */
export const MAX_TEAM_SIZE = 6;

export interface TeamMember {
  id: number;
  name: string;
  types: PokemonType[];
  spriteUrl: string | null;
}
