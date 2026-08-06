import { POKEMON_TYPES, type PokemonType } from '../domain/types';

const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * The national dex currently ends here. Ids above this range belong to
 * alternate forms, which PokeAPI numbers from 10001 and which have no dex entry
 * of their own, so paging past this point would show duplicates of Pokemon the
 * user has already scrolled through.
 */
export const NATIONAL_DEX_SIZE = 1025;

export class PokemonNotFoundError extends Error {
  constructor(query: string) {
    super(`No Pokemon called "${query}".`);
    this.name = 'PokemonNotFoundError';
  }
}

async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    // A 404 here means the name was simply wrong, which is a normal outcome of
    // searching and not a failure worth an error screen.
    if (response.status === 404) throw new PokemonNotFoundError(path);
    throw new Error(`PokeAPI responded with ${response.status}.`);
  }
  return (await response.json()) as T;
}

/** Only the fields this app actually reads, rather than the full payload. */
interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  species: { name: string };
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null; front_shiny: string | null };
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  /** Metres. PokeAPI reports decimetres. */
  height: number;
  /** Kilograms. PokeAPI reports hectograms. */
  weight: number;
  types: PokemonType[];
  abilities: { name: string; isHidden: boolean }[];
  stats: { name: string; value: number }[];
  species: string;
  spriteUrl: string | null;
}

function isPokemonType(value: string): value is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

/**
 * Narrows the API payload down to what the interface needs.
 *
 * Doing this at the boundary means the rest of the app never handles PokeAPI's
 * shape, and the type analysis can rely on `PokemonType` being one of eighteen
 * known values rather than any string the API happens to return.
 */
function toPokemon(raw: RawPokemon): Pokemon {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height / 10,
    weight: raw.weight / 10,
    types: raw.types
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => entry.type.name)
      .filter(isPokemonType),
    abilities: raw.abilities.map((entry) => ({
      name: entry.ability.name,
      isHidden: entry.is_hidden,
    })),
    stats: raw.stats.map((entry) => ({ name: entry.stat.name, value: entry.base_stat })),
    species: raw.species.name,
    spriteUrl:
      raw.sprites.other?.['official-artwork']?.front_default ??
      raw.sprites.other?.['official-artwork']?.front_shiny ??
      raw.sprites.front_default,
  };
}

export async function fetchPokemon(idOrName: string | number): Promise<Pokemon> {
  const raw = await getJSON<RawPokemon>(`/pokemon/${idOrName}`);
  return toPokemon(raw);
}

/**
 * The dex ids on one page.
 *
 * Ids are sequential, so the page can be worked out arithmetically instead of
 * asking the API for an index first. That removes a request from every page
 * turn, and more usefully it removes a dependency: the detail queries can start
 * immediately rather than waiting on a list response.
 */
export function dexPage(page: number, pageSize: number): number[] {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, NATIONAL_DEX_SIZE);
  if (start > NATIONAL_DEX_SIZE) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function totalPages(pageSize: number): number {
  return Math.ceil(NATIONAL_DEX_SIZE / pageSize);
}

interface RawTypeIndex {
  pokemon: { pokemon: { name: string; url: string } }[];
}

/**
 * Dex ids of every Pokemon with a given type.
 *
 * The id is pulled from the resource URL rather than requesting each Pokemon,
 * because this list is only used to decide what to load next. Alternate forms
 * are dropped for the same reason the dex is capped.
 */
export async function fetchTypeMembers(type: PokemonType): Promise<number[]> {
  const raw = await getJSON<RawTypeIndex>(`/type/${type}`);
  return raw.pokemon
    .map((entry) => Number(entry.pokemon.url.split('/').filter(Boolean).pop()))
    .filter((id) => Number.isFinite(id) && id <= NATIONAL_DEX_SIZE)
    .sort((a, b) => a - b);
}
