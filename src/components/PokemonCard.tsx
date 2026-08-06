import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import type { Pokemon } from '../api/pokeapi';
import { cn, dexNumber, titleCase } from '../lib/utils';
import TypeChip from './TypeChip';
import { Button } from './ui/button';

export interface PokemonCardProps {
  pokemon: Pokemon;
  isOnTeam: boolean;
  onToggleTeam: (pokemon: Pokemon) => void;
}

/**
 * A specimen card: catalogue number, the specimen itself, and its
 * classification. The number is set in mono at the top because it is a real
 * identifier people search by, not a decorative counter.
 */
function PokemonCard({ pokemon, isOnTeam, onToggleTeam }: PokemonCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/30">
      <Link
        to={`/pokemon/${pokemon.id}`}
        className="flex flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center justify-between px-2.5 pt-2.5">
          <span className="tabular font-mono text-eyebrow text-muted-foreground">
            {dexNumber(pokemon.id)}
          </span>
        </div>

        <div className="aspect-square px-3">
          {pokemon.spriteUrl ? (
            <img
              src={pokemon.spriteUrl}
              alt={titleCase(pokemon.name)}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
              no image
            </div>
          )}
        </div>

        <div className="px-2.5 pb-2.5">
          <h3 className="truncate font-medium leading-tight">{titleCase(pokemon.name)}</h3>
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {pokemon.types.map((type) => (
              <li key={type}>
                <TypeChip type={type} />
              </li>
            ))}
          </ul>
        </div>
      </Link>

      <div className="border-t p-1.5">
        <Button
          variant={isOnTeam ? 'outline' : 'ghost'}
          size="sm"
          className={cn('w-full', isOnTeam && 'text-shield')}
          onClick={() => onToggleTeam(pokemon)}
          aria-pressed={isOnTeam}
          aria-label={
            isOnTeam
              ? `Remove ${titleCase(pokemon.name)} from your team`
              : `Add ${titleCase(pokemon.name)} to your team`
          }
        >
          {isOnTeam ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {isOnTeam ? 'On team' : 'Add'}
        </Button>
      </div>
    </article>
  );
}

export default memo(PokemonCard);
