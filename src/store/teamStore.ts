import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_TEAM_SIZE, type TeamMember } from '../domain/types';

/**
 * Zustand rather than Redux, deliberately.
 *
 * The only client state in this app is a list of at most six Pokemon. Redux
 * would mean a store, a slice, and middleware to persist it, which is a lot of
 * apparatus around one array. The `persist` middleware here covers the same
 * ground in a line.
 */

export type AddResult = 'added' | 'full' | 'duplicate';

interface TeamState {
  team: TeamMember[];
  add: (member: TeamMember) => AddResult;
  remove: (id: number) => void;
  clear: () => void;
}

export const TEAM_STORAGE_KEY = 'pokepick.team';

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      team: [],

      /**
       * Returns why an add failed rather than silently doing nothing, so the
       * caller can say "team is full" instead of leaving the user to guess why
       * their click had no effect.
       */
      add: (member) => {
        const { team } = get();
        if (team.some((existing) => existing.id === member.id)) return 'duplicate';
        if (team.length >= MAX_TEAM_SIZE) return 'full';
        set({ team: [...team, member] });
        return 'added';
      },

      remove: (id) => set({ team: get().team.filter((member) => member.id !== id) }),

      clear: () => set({ team: [] }),
    }),
    {
      name: TEAM_STORAGE_KEY,
      // Only the roster is worth keeping. Persisting the actions would store
      // functions, which do not survive JSON.
      partialize: (state) => ({ team: state.team }),
    }
  )
);

/** Selector kept out of components so the membership rule lives in one place. */
export const selectIsOnTeam = (id: number) => (state: TeamState) =>
  state.team.some((member) => member.id === id);
