import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { usePokemon } from '../api/queries';
import { useTeamStore } from '../store/teamStore';
import { toTeamMember } from '../lib/toTeamMember';
import { POKEMON_TYPES } from '../domain/types';
import { effectivenessAgainst } from '../domain/typeChart';
import { cn, dexNumber, titleCase } from '../lib/utils';
import TypeChip from '../components/TypeChip';
import { Button, buttonVariants } from '../components/ui/button';

/** PokeAPI stat slugs are terse to the point of being cryptic on screen. */
const STAT_LABEL: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
};

/** 255 is the highest base stat any species has, so it is the honest ceiling. */
const MAX_BASE_STAT = 255;

function StatBar({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-sm text-muted-foreground">
        {STAT_LABEL[name] ?? titleCase(name)}
      </span>
      <span className="tabular w-10 shrink-0 text-right font-mono text-sm">{value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
        <div
          className="h-full rounded-sm bg-primary"
          style={{ width: `${(value / MAX_BASE_STAT) * 100}%` }}
        />
      </div>
    </div>
  );
}

function PokemonDetail() {
  const { id } = useParams();
  // The id is part of the query key, so navigating between Pokemon refetches
  // properly. The earlier version fetched inside an effect with no dependency
  // on it, which meant the page kept whichever Pokemon it loaded first.
  const { data: pokemon, isPending, isError } = usePokemon(id);

  const team = useTeamStore((state) => state.team);
  const add = useTeamStore((state) => state.add);
  const remove = useTeamStore((state) => state.remove);

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="aspect-video rounded-lg bg-muted" />
        </div>
      </main>
    );
  }

  if (isError || !pokemon) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 text-center sm:px-6">
        <h1 className="text-base font-medium">No dex entry for &ldquo;{id}&rdquo;</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The name or number does not match anything in the National Pokedex.
        </p>
        <Link to="/" className={cn(buttonVariants(), 'mt-5')}>
          Back to the dex
        </Link>
      </main>
    );
  }

  const isOnTeam = team.some((member) => member.id === pokemon.id);
  const weaknesses = POKEMON_TYPES.map((type) => ({
    type,
    multiplier: effectivenessAgainst(type, pokemon.types),
  }));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All Pokemon
      </Link>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section className="rounded-lg border bg-card p-5">
          <p className="tabular font-mono text-eyebrow text-muted-foreground">
            {dexNumber(pokemon.id)}
          </p>
          {pokemon.spriteUrl && (
            <img
              src={pokemon.spriteUrl}
              alt={titleCase(pokemon.name)}
              className="mx-auto aspect-square w-full max-w-xs object-contain"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight">{titleCase(pokemon.name)}</h1>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {pokemon.types.map((type) => (
              <li key={type}>
                <TypeChip type={type} />
              </li>
            ))}
          </ul>

          <Button
            className="mt-5 w-full"
            variant={isOnTeam ? 'outline' : 'default'}
            onClick={() => (isOnTeam ? remove(pokemon.id) : add(toTeamMember(pokemon)))}
            aria-pressed={isOnTeam}
          >
            {isOnTeam ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isOnTeam ? 'On your team' : 'Add to team'}
          </Button>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Height</dt>
              <dd className="tabular font-mono">{pokemon.height} m</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Weight</dt>
              <dd className="tabular font-mono">{pokemon.weight} kg</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Abilities</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {pokemon.abilities.map((ability) => (
                  <span
                    key={ability.name}
                    className={cn(
                      'rounded-sm px-1.5 py-0.5 text-xs',
                      ability.isHidden ? 'border border-dashed' : 'bg-muted'
                    )}
                    title={ability.isHidden ? 'Hidden ability' : undefined}
                  >
                    {titleCase(ability.name)}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </section>

        <div className="space-y-5">
          <section aria-labelledby="stats-heading" className="rounded-lg border bg-card p-5">
            <h2 id="stats-heading" className="text-eyebrow uppercase text-muted-foreground">
              Base stats
            </h2>
            <div className="mt-4 space-y-2.5">
              {pokemon.stats.map((stat) => (
                <StatBar key={stat.name} name={stat.name} value={stat.value} />
              ))}
            </div>
          </section>

          <section aria-labelledby="matchups-heading" className="rounded-lg border bg-card p-5">
            <h2 id="matchups-heading" className="text-eyebrow uppercase text-muted-foreground">
              Damage taken
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {weaknesses
                .filter((entry) => entry.multiplier !== 1)
                .sort((a, b) => b.multiplier - a.multiplier)
                .map((entry) => (
                  <li key={entry.type} className="flex items-center justify-between gap-2">
                    <TypeChip type={entry.type} />
                    <span
                      className={cn(
                        'tabular font-mono text-xs',
                        entry.multiplier > 1 ? 'text-hazard' : 'text-shield'
                      )}
                    >
                      {entry.multiplier}x
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

export default PokemonDetail;
