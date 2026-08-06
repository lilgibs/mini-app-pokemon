import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { MAX_TEAM_SIZE } from '../domain/types';
import { summarizeTeam } from '../domain/teamAnalysis';
import { cn, dexNumber, titleCase } from '../lib/utils';
import ResistanceMatrix from '../components/ResistanceMatrix';
import CoverageReport, { ThreatSummary } from '../components/CoverageReport';
import TypeChip from '../components/TypeChip';
import { Button, buttonVariants } from '../components/ui/button';

function Team() {
  const team = useTeamStore((state) => state.team);
  const remove = useTeamStore((state) => state.remove);
  const clear = useTeamStore((state) => state.clear);

  const summary = summarizeTeam(team);
  const emptySlots = Math.max(0, MAX_TEAM_SIZE - team.length);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <section aria-labelledby="roster-heading" className="rounded-lg border bg-card p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h1 id="roster-heading" className="text-eyebrow uppercase text-muted-foreground">
            Roster
          </h1>
          {team.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear team
            </Button>
          )}
        </div>

        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {team.map((member) => (
            <li key={member.id} className="relative rounded-md border bg-background p-2">
              <span className="tabular font-mono text-eyebrow text-muted-foreground">
                {dexNumber(member.id)}
              </span>
              {member.spriteUrl ? (
                <img
                  src={member.spriteUrl}
                  alt={titleCase(member.name)}
                  className="aspect-square w-full object-contain"
                />
              ) : (
                <div className="aspect-square" />
              )}
              <p className="truncate text-xs font-medium">{titleCase(member.name)}</p>
              <ul className="mt-1 flex flex-wrap gap-1">
                {member.types.map((type) => (
                  <li key={type}>
                    <TypeChip type={type} />
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-7 w-7 text-muted-foreground hover:text-hazard"
                onClick={() => remove(member.id)}
                aria-label={`Remove ${titleCase(member.name)} from your team`}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}

          {Array.from({ length: emptySlots }, (_, index) => (
            <li
              key={`empty-${index}`}
              className="flex min-h-24 items-center justify-center rounded-md border border-dashed"
            >
              <span className="font-mono text-eyebrow text-muted-foreground/50">empty</span>
            </li>
          ))}
        </ul>
      </section>

      {team.length === 0 ? (
        <section className="rounded-lg border border-dashed px-6 py-14 text-center">
          <h2 className="text-base font-medium">Nothing to analyse yet</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            Add a Pokemon and this page fills in: which attacking types your roster folds to, and
            which types it has no answer for.
          </p>
          {/* A link styled as a button, not a button wrapping a link: nesting an
              anchor inside a button is invalid HTML and confuses assistive tech
              about what the control actually is. */}
          <Link to="/" className={cn(buttonVariants(), 'mt-5')}>
            Browse the dex
          </Link>
        </section>
      ) : (
        <>
          <section aria-labelledby="threats-heading" className="rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <h2 id="threats-heading" className="text-eyebrow uppercase text-muted-foreground">
                Resistance matrix
              </h2>
              {/* The conclusion comes before the grid. The grid is the evidence. */}
              <ThreatSummary team={team} sharedWeaknesses={summary.sharedWeaknesses} />
            </div>

            <div className="mt-4">
              <ResistanceMatrix team={team} />
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-4 font-mono text-eyebrow uppercase text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="inline-block size-3 rounded-sm bg-hazard/85" />
                takes more damage
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="inline-block size-3 rounded-sm bg-shield/70" />
                resists or is immune
              </span>
            </p>
          </section>

          <CoverageReport team={team} />
        </>
      )}
    </main>
  );
}

export default Team;
