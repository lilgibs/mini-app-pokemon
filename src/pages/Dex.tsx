import { useMemo, useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { dexPage, totalPages, type Pokemon } from '../api/pokeapi';
import { usePokemon, usePokemonList, useTypeMembers } from '../api/queries';
import { POKEMON_TYPES, type PokemonType } from '../domain/types';
import { useTeamStore } from '../store/teamStore';
import { toTeamMember } from '../lib/toTeamMember';
import { titleCase } from '../lib/utils';
import PokemonCard from '../components/PokemonCard';
import TypeChip from '../components/TypeChip';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 24;

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-card">
      <div className="aspect-square m-4 rounded bg-muted" />
      <div className="space-y-2 px-3 pb-3">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
      <div className="border-t p-2">
        <div className="h-8 rounded bg-muted" />
      </div>
    </div>
  );
}

function Dex() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const team = useTeamStore((state) => state.team);
  const add = useTeamStore((state) => state.add);
  const remove = useTeamStore((state) => state.remove);
  const [notice, setNotice] = useState<string | null>(null);

  const typeMembers = useTypeMembers(typeFilter);

  /**
   * Which dex ids this screen is showing.
   *
   * Without a filter the page is pure arithmetic, so no request is needed to
   * work out what to load. With a filter the ids come from the type index and
   * are paged in memory, since that list arrives complete.
   */
  const ids = useMemo(() => {
    if (typeFilter) {
      const all = typeMembers.data ?? [];
      return all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    }
    return dexPage(page, PAGE_SIZE);
  }, [typeFilter, typeMembers.data, page]);

  const list = usePokemonList(searchTerm ? [] : ids);
  const search = usePokemon(searchTerm || undefined);

  const pageCount = typeFilter
    ? Math.max(1, Math.ceil((typeMembers.data?.length ?? 0) / PAGE_SIZE))
    : totalPages(PAGE_SIZE);

  const onTeam = new Set(team.map((member) => member.id));

  const toggleTeam = (pokemon: Pokemon) => {
    if (onTeam.has(pokemon.id)) {
      remove(pokemon.id);
      setNotice(null);
      return;
    }
    const result = add(toTeamMember(pokemon));
    // Say why nothing happened. A button that silently does nothing reads as broken.
    setNotice(result === 'full' ? 'Your team is already six. Remove one to add another.' : null);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearchTerm(searchInput.trim().toLowerCase().replace(/\s+/g, '-'));
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  const chooseType = (type: PokemonType | null) => {
    setTypeFilter(type);
    setPage(1);
    clearSearch();
  };

  const results = searchTerm ? (search.data ? [search.data] : []) : list.pokemon;
  const isLoading = searchTerm ? search.isPending : list.isLoading;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name"
            aria-label="Search Pokemon by name"
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-20 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {searchTerm && (
              <Button variant="ghost" size="sm" onClick={clearSearch} aria-label="Clear search">
                <X aria-hidden="true" />
              </Button>
            )}
            <Button type="submit" size="sm">
              Find
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => chooseType(null)}
          aria-pressed={typeFilter === null}
          className="rounded-sm px-1.5 py-0.5 font-mono text-eyebrow uppercase text-muted-foreground hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background"
        >
          all
        </button>
        {POKEMON_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => chooseType(typeFilter === type ? null : type)}
            aria-pressed={typeFilter === type}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <TypeChip
              type={type}
              className={typeFilter === type ? 'ring-1 ring-foreground' : 'opacity-60'}
            />
          </button>
        ))}
      </div>

      {notice && (
        <p role="status" className="mt-4 rounded-md border border-hazard/40 bg-hazard/10 px-3 py-2 text-sm text-hazard">
          {notice}
        </p>
      )}

      {searchTerm && search.isError && (
        <p className="mt-8 text-sm">
          Nothing in the dex is called &ldquo;{titleCase(searchTerm)}&rdquo;. Check the spelling,
          or{' '}
          <button type="button" onClick={clearSearch} className="text-primary underline underline-offset-4">
            browse the full list
          </button>
          .
        </p>
      )}

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: searchTerm ? 1 : PAGE_SIZE }, (_, index) => (
              <li key={index}>
                <CardSkeleton />
              </li>
            ))
          : results.map((pokemon, index) => (
              <li
                key={pokemon.id}
                className="animate-rise-in"
                style={{ animationDelay: `${Math.min(index, 11) * 25}ms` }}
              >
                <PokemonCard
                  pokemon={pokemon}
                  isOnTeam={onTeam.has(pokemon.id)}
                  onToggleTeam={toggleTeam}
                />
              </li>
            ))}
      </ul>

      {!searchTerm && pageCount > 1 && (
        <nav aria-label="Dex pages" className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <p className="tabular font-mono text-sm text-muted-foreground">
            {page} / {pageCount}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={page === pageCount}
            aria-label="Next page"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </main>
  );
}

export default Dex;
