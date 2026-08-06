import { NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { MAX_TEAM_SIZE } from '../domain/types';
import { useTheme } from '../theme/ThemeProvider';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-2.5 py-1.5 text-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    isActive ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
  );

function AppHeader() {
  const teamSize = useTeamStore((state) => state.team.length);
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1">
          <span className="mr-3 font-mono text-eyebrow uppercase tracking-widest">Pokedex</span>
          <NavLink to="/" className={linkClass} end>
            Browse
          </NavLink>
          <NavLink to="/team" className={linkClass}>
            Team
            {/* The count is the point of the link, so it sits inside it rather
                than floating as a badge the eye has to associate. */}
            <span className="tabular ml-1.5 font-mono text-xs text-muted-foreground">
              {teamSize}/{MAX_TEAM_SIZE}
            </span>
          </NavLink>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>
      </div>
    </header>
  );
}

export default AppHeader;
