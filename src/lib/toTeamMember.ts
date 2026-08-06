import type { Pokemon } from '../api/pokeapi';
import type { TeamMember } from '../domain/types';

/**
 * Narrows a full API record down to what the roster needs.
 *
 * The team is persisted to localStorage, so storing the whole payload would put
 * stats, abilities, and every sprite variant on disk for six Pokemon that only
 * need a name, a typing, and one image. The analysis reads nothing else.
 */
export function toTeamMember(pokemon: Pokemon): TeamMember {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    spriteUrl: pokemon.spriteUrl,
  };
}
