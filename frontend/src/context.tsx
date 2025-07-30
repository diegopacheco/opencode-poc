import { useState } from 'react';
import type { ReactNode } from 'react';
import type { TeamMember, Team, Feedback } from './types';
import { AppContext } from './appContext';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const addMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: crypto.randomUUID(),
    };
    setMembers(prev => [...prev, newMember]);
  };

  const addTeam = (team: Omit<Team, 'id' | 'members'>) => {
    const newTeam: Team = {
      ...team,
      id: crypto.randomUUID(),
      members: [],
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const assignMemberToTeam = (memberId: string, teamId: string) => {
    setMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, teamId } : member
      )
    );
    
    setTeams(prev => 
      prev.map(team => {
        if (team.id === teamId) {
          const member = members.find(m => m.id === memberId);
          if (member && !team.members.find(m => m.id === memberId)) {
            return { ...team, members: [...team.members, { ...member, teamId }] };
          }
        }
        return {
          ...team,
          members: team.members.filter(m => m.id !== memberId)
        };
      })
    );
  };

  const addFeedback = (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setFeedbacks(prev => [...prev, newFeedback]);
  };

  return (
    <AppContext.Provider value={{
      members,
      teams,
      feedbacks,
      addMember,
      addTeam,
      assignMemberToTeam,
      addFeedback,
    }}>
      {children}
    </AppContext.Provider>
  );
};