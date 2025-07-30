import { createContext, useContext } from 'react';
import type { TeamMember, Team, Feedback } from './types';

export interface AppContextType {
  members: TeamMember[];
  teams: Team[];
  feedbacks: Feedback[];
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  addTeam: (team: Omit<Team, 'id' | 'members'>) => void;
  assignMemberToTeam: (memberId: string, teamId: string) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};