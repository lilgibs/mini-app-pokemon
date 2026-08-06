import { POKEMON_TYPES, type TeamMember } from '../domain/types';
import { offensiveCoverage } from '../domain/teamAnalysis';
import { cn, titleCase } from '../lib/utils';
import TypeChip from './TypeChip';

export interface CoverageReportProps {
  team: readonly TeamMember[];
}

/**
 * What the team can and cannot hit hard.
 *
 * Each Pokemon's own types stand in for the moves it would carry. PokeAPI can
 * list every move a species learns, but a real moveset is four slots chosen by
 * a player, and guessing it would make these numbers look precise while being
 * invented. Same-type attacks are the one assumption that holds for almost any
 * build, and saying so out loud is better than a footnote nobody reads.
 */
function CoverageReport({ team }: CoverageReportProps) {
  const coverage = offensiveCoverage(team);
  const gaps = coverage.filter((row) => row.coveredBy.length === 0);
  const covered = POKEMON_TYPES.length - gaps.length;

  return (
    <section aria-labelledby="coverage-heading" className="rounded-lg border bg-card p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="coverage-heading" className="text-eyebrow uppercase text-muted-foreground">
          Offensive coverage
        </h2>
        <p className="tabular font-mono text-sm">
          <span className={cn(covered < 10 && 'text-hazard')}>{covered}</span>
          <span className="text-muted-foreground">/{POKEMON_TYPES.length}</span>
        </p>
      </div>

      {gaps.length === 0 ? (
        <p className="mt-4 text-sm">
          This roster can hit every type for extra damage. Nothing walls it outright.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            No member carries a type that hits these hard:
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {gaps.map((row) => (
              <li key={row.type}>
                <TypeChip type={row.type} />
              </li>
            ))}
          </ul>
        </>
      )}

      <details className="mt-5 border-t pt-4">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          How this is worked out
        </summary>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Each Pokemon is assumed to attack with its own types. Real movesets are four slots
          picked by a player, so anything more specific would be guesswork dressed up as data.
          Read this as the coverage a roster has before any move is chosen.
        </p>
      </details>
    </section>
  );
}

export default CoverageReport;

export interface ThreatSummaryProps {
  team: readonly TeamMember[];
  sharedWeaknesses: { type: (typeof POKEMON_TYPES)[number]; weakTo: number }[];
}

/** The one sentence a player actually acts on, stated before the grid. */
export function ThreatSummary({ team, sharedWeaknesses }: ThreatSummaryProps) {
  if (team.length === 0) return null;

  if (sharedWeaknesses.length === 0) {
    return (
      <p className="text-sm">
        No attacking type beats more than half this roster. The spread is even.
      </p>
    );
  }

  return (
    <p className="text-sm">
      {sharedWeaknesses.map((row, index) => (
        <span key={row.type}>
          {index > 0 && <span className="text-muted-foreground"> and </span>}
          <span className="tabular font-mono">{row.weakTo}</span>
          <span className="text-muted-foreground"> of </span>
          <span className="tabular font-mono">{team.length}</span>
          <span className="text-muted-foreground"> fold to </span>
          <span className="font-semibold text-hazard">{titleCase(row.type)}</span>
        </span>
      ))}
      <span className="text-muted-foreground">.</span>
    </p>
  );
}
