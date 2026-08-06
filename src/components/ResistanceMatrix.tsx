import { POKEMON_TYPES, type PokemonType, type TeamMember } from '../domain/types';
import { effectivenessAgainst } from '../domain/typeChart';
import { defensiveThreats } from '../domain/teamAnalysis';
import { cn, titleCase } from '../lib/utils';

/**
 * Multipliers are written the way a player writes them on paper, not as
 * decimals. "1/4" carries more instantly than "0.25", and an empty cell for
 * neutral damage is the point: what matters is where the grid is not empty.
 */
const LABEL: Record<number, string> = {
  0: '0',
  0.25: '1/4',
  0.5: '1/2',
  1: '',
  2: '2',
  4: '4',
};

/**
 * A diverging scale, warm for damage taken and cool for damage resisted.
 *
 * Opacity carries the magnitude so that 4x reads as heavier than 2x without
 * introducing a second hue. This is why the eighteen type colours are kept out
 * of this grid: severity has to be the only thing colour is saying here.
 */
function cellClass(multiplier: number): string {
  if (multiplier >= 4) return 'bg-hazard/85 text-white';
  if (multiplier >= 2) return 'bg-hazard/45 text-foreground';
  if (multiplier === 0) return 'bg-shield/70 text-white';
  if (multiplier <= 0.25) return 'bg-shield/45 text-foreground';
  if (multiplier < 1) return 'bg-shield/20 text-foreground';
  return 'text-muted-foreground/40';
}

export interface ResistanceMatrixProps {
  team: readonly TeamMember[];
}

/**
 * The centrepiece. Rows are the roster, columns are the eighteen attacking
 * types, and the bottom row totals how many members fold to each one.
 *
 * It is deliberately dense. This is the artifact a competitive player would
 * sketch by hand, and spreading it out into eighteen separate cards would lose
 * the only thing that makes it useful: being able to see a vertical stripe of
 * warm cells and know instantly that the whole team shares a hole.
 */
function ResistanceMatrix({ team }: ResistanceMatrixProps) {
  const threats = defensiveThreats(team);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-center">
        <caption className="sr-only">
          Damage multipliers taken by each team member against every attacking type
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-card px-2 pb-2 text-left text-eyebrow uppercase text-muted-foreground"
            >
              Attacked by
            </th>
            {POKEMON_TYPES.map((type) => (
              <th
                key={type}
                scope="col"
                className="pb-2 font-mono text-eyebrow uppercase text-muted-foreground"
                title={titleCase(type)}
              >
                {type.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {team.map((member) => (
            <tr key={member.id}>
              <th
                scope="row"
                className="sticky left-0 z-10 max-w-[9rem] truncate bg-card px-2 py-1 text-left text-sm font-medium"
              >
                {titleCase(member.name)}
              </th>
              {POKEMON_TYPES.map((type) => {
                const multiplier = effectivenessAgainst(type, member.types);
                return (
                  <td key={type} className="p-px">
                    <div
                      className={cn(
                        'tabular flex h-7 items-center justify-center font-mono text-xs',
                        cellClass(multiplier)
                      )}
                    >
                      <span className="sr-only">
                        {titleCase(member.name)} takes {multiplier}x from {type}.
                      </span>
                      <span aria-hidden="true">{LABEL[multiplier] ?? `${multiplier}`}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <th
              scope="row"
              className="sticky left-0 z-10 bg-card px-2 pt-2 text-left text-eyebrow uppercase text-muted-foreground"
            >
              Members weak
            </th>
            {threats.map((row) => (
              <td key={row.type} className="pt-2">
                <span
                  className={cn(
                    'tabular font-mono text-sm',
                    row.weakTo === 0 && 'text-muted-foreground/40',
                    // Half the roster is where a single type stops being an
                    // inconvenience and starts deciding matches.
                    row.weakTo > 0 && row.weakTo < team.length / 2 && 'text-foreground',
                    row.weakTo >= team.length / 2 && 'font-semibold text-hazard'
                  )}
                >
                  {row.weakTo}
                </span>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ResistanceMatrix;
export type { PokemonType };
