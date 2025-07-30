import { createContext, useContext } from 'react';
import type { TeamMember, Team, Feedback } from './types';

export interface AppContextType {
  members: TeamMember[];
  teams: Team[];
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
  addMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  addTeam: (team: Omit<Team, 'id' | 'members'>) => Promise<void>;
  assignMemberToTeam: (memberId: string, teamId: string) => Promise<void>;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Promise<void>;
  loadTeams: () => Promise<void>;
  loadMembers: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};