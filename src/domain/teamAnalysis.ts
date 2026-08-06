import { POKEMON_TYPES, type PokemonType, type TeamMember } from './types';
import { effectivenessAgainst } from './typeChart';

/**
 * How one attacking type fares against the whole team.
 *
 * `weakTo` counts members taking at least double damage. `resists` counts those
 * taking half or less, immunities included. Both are reported rather than a
 * single net score, because they are not interchangeable: a team where three
 * members fold to Ground and three shrug it off is a very different team from
 * one where all six take neutral damage, even though the averages match.
 */
export interface ThreatRow {
  type: PokemonType;
  weakTo: number;
  resists: number;
  /** The worst multiplier any single member takes, so 4x damage stays visible. */
  maxMultiplier: number;
}

export function defensiveThreats(team: readonly TeamMember[]): ThreatRow[] {
  return POKEMON_TYPES.map((type) => {
    let weakTo = 0;
    let resists = 0;
    let maxMultiplier = 0;

    for (const member of team) {
      const multiplier = effectivenessAgainst(type, member.types);
      if (multiplier >= 2) weakTo += 1;
      else if (multiplier < 1) resists += 1;
      if (multiplier > maxMultiplier) maxMultiplier = multiplier;
    }

    return { type, weakTo, resists, maxMultiplier };
  });
}

/**
 * The threats worth acting on, worst first.
 *
 * Sorted by how many members fold, then by the worst single multiplier, so a
 * 4x hit outranks a 2x hit when the counts tie. Types nobody is weak to are
 * dropped: a list of eighteen rows where most read "0" buries the two that
 * matter.
 */
export function rankedThreats(team: readonly TeamMember[]): ThreatRow[] {
  return defensiveThreats(team)
    .filter((row) => row.weakTo > 0)
    .sort((a, b) => b.weakTo - a.weakTo || b.maxMultiplier - a.maxMultiplier);
}

export interface CoverageRow {
  type: PokemonType;
  /** Team members holding an attacking type that hits this defender hard. */
  coveredBy: string[];
}

/**
 * Which defending types the team can hit for super effective damage.
 *
 * A Pokemon's own types stand in for the moves it would carry. That is a
 * deliberate simplification: PokeAPI can list every move a species learns, but
 * a real moveset is four slots chosen by a player, and guessing it would make
 * the numbers look precise while being invented. Same-type attacks are the one
 * assumption that holds for almost any build.
 */
export function offensiveCoverage(team: readonly TeamMember[]): CoverageRow[] {
  return POKEMON_TYPES.map((defender) => ({
    type: defender,
    coveredBy: team
      .filter((member) =>
        member.types.some((attacker) => effectivenessAgainst(attacker, [defender]) >= 2)
      )
      .map((member) => member.name),
  }));
}

/** Defending types no team member can hit for extra damage. */
export function coverageGaps(team: readonly TeamMember[]): PokemonType[] {
  return offensiveCoverage(team)
    .filter((row) => row.coveredBy.length === 0)
    .map((row) => row.type);
}

export interface TeamSummary {
  /** Types at least half the team folds to, the ones worth restructuring for. */
  sharedWeaknesses: ThreatRow[];
  /** Every type at least one member is weak to, worst first. */
  threats: ThreatRow[];
  gaps: PokemonType[];
  /** Types the team hits hard, out of eighteen. */
  typesCovered: number;
}

export function summarizeTeam(team: readonly TeamMember[]): TeamSummary {
  const threats = rankedThreats(team);
  const gaps = coverageGaps(team);

  /**
   * Half the roster is where a single attacking type stops being an
   * inconvenience and starts deciding matches, but half of two is one, and one
   * member being weak to something is just how Pokemon works. Two members is
   * the floor for calling a weakness shared, so a small team reports the types
   * every one of them folds to rather than every type at all.
   */
  const sharedFloor = Math.max(2, Math.ceil(team.length / 2));

  return {
    sharedWeaknesses: threats.filter((row) => row.weakTo >= sharedFloor),
    threats,
    gaps,
    typesCovered: POKEMON_TYPES.length - gaps.length,
  };
}
