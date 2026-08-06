import type { PokemonType } from '../domain/types';
import { cn } from '../lib/utils';

/**
 * The eighteen type colours, desaturated to sit inside this palette.
 *
 * These are the only place type colour appears. The analysis views use a
 * diverging weak-to-resistant scale instead, because eighteen hues competing
 * inside a data grid is noise: nothing reads as important when everything is
 * coloured. Keeping the hues on the chips means they stay useful for what they
 * are actually good at, which is recognising a Pokemon's typing at a glance.
 *
 * Written as literal class strings so Tailwind's scanner can see them.
 */
const TYPE_CLASS: Record<PokemonType, string> = {
  normal: 'bg-stone-400/15 text-stone-700 dark:text-stone-300',
  fire: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  water: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  electric: 'bg-amber-400/20 text-amber-700 dark:text-amber-300',
  grass: 'bg-green-500/15 text-green-700 dark:text-green-400',
  ice: 'bg-cyan-400/15 text-cyan-700 dark:text-cyan-300',
  fighting: 'bg-red-700/15 text-red-800 dark:text-red-400',
  poison: 'bg-fuchsia-600/15 text-fuchsia-700 dark:text-fuchsia-400',
  ground: 'bg-yellow-700/15 text-yellow-800 dark:text-yellow-500',
  flying: 'bg-indigo-400/15 text-indigo-700 dark:text-indigo-300',
  psychic: 'bg-pink-500/15 text-pink-700 dark:text-pink-400',
  bug: 'bg-lime-600/15 text-lime-800 dark:text-lime-400',
  rock: 'bg-amber-800/15 text-amber-900 dark:text-amber-600',
  ghost: 'bg-violet-700/15 text-violet-700 dark:text-violet-400',
  dragon: 'bg-purple-700/15 text-purple-700 dark:text-purple-400',
  dark: 'bg-slate-700/15 text-slate-700 dark:text-slate-300',
  steel: 'bg-slate-400/20 text-slate-600 dark:text-slate-300',
  fairy: 'bg-rose-400/15 text-rose-700 dark:text-rose-300',
};

export interface TypeChipProps {
  type: PokemonType;
  className?: string;
}

function TypeChip({ type, className }: TypeChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-eyebrow uppercase',
        TYPE_CLASS[type],
        className
      )}
    >
      {type}
    </span>
  );
}

export default TypeChip;
