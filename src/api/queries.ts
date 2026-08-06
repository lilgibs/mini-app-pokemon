import { useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchPokemon, fetchTypeMembers, type Pokemon } from './pokeapi';
import type { PokemonType } from '../domain/types';

/**
 * Pokemon data does not change, so once something is fetched it is never worth
 * fetching again for the life of the tab.
 *
 * This is also what fixes two bugs the earlier version had. Requests are keyed
 * and deduplicated, so a response that arrives late can no longer overwrite the
 * page the user has since moved to, and paging back to a screen already visited
 * costs nothing instead of twenty fresh requests.
 */
const FOREVER = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

export function pokemonQueryOptions(idOrName: string | number) {
  return {
    queryKey: ['pokemon', String(idOrName).toLowerCase()],
    queryFn: () => fetchPokemon(idOrName),
    ...FOREVER,
  };
}

export function usePokemon(idOrName: string | number | undefined) {
  return useQuery({
    ...pokemonQueryOptions(idOrName ?? ''),
    enabled: idOrName !== undefined && idOrName !== '',
  });
}

export interface PokemonListResult {
  pokemon: Pokemon[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Loads a page of Pokemon as one query per entry rather than a single batch.
 *
 * The extra bookkeeping buys something specific: opening a Pokemon's detail
 * page is instant, because that exact query was already resolved while the card
 * was on screen. A single combined query would cache the page as one blob that
 * nothing else could read from.
 */
export function usePokemonList(ids: readonly number[]): PokemonListResult {
  const results = useQueries({
    queries: ids.map((id) => pokemonQueryOptions(id)),
  });

  return {
    pokemon: results.flatMap((result: UseQueryResult<Pokemon>) =>
      result.data ? [result.data] : []
    ),
    // Loading stays true until the whole page is in, so the grid does not
    // reflow while entries trickle into place.
    isLoading: results.some((result) => result.isPending),
    isError: results.every((result) => result.isError) && results.length > 0,
  };
}

export function useTypeMembers(type: PokemonType | null) {
  return useQuery({
    queryKey: ['type', type],
    queryFn: () => fetchTypeMembers(type as PokemonType),
    enabled: type !== null,
    ...FOREVER,
  });
}
