import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TeamMember, Team, Feedback } from './types';
import { AppContext } from './appContext';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (err: unknown, operation: string) => {
    console.error(`Error ${operation}:`, err);
    if (err instanceof Error) {
      if (err.message.includes('fetch')) {
        setError('Cannot connect to the backend server. Please make sure the backend is running.');
      } else {
        setError(err.message);
      }
    } else {
      setError(`An unexpected error occurred during ${operation}`);
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/teams`);
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }
      const data = await response.json();
      
      const teamsData = Array.isArray(data) 
        ? data.map(team => ({
            id: team.id,
            name: team.name,
            logo: team.logo,
            members: Array.isArray(team.members) ? team.members.map((member: any) => ({
              id: member.id,
              name: member.name,
              picture: member.picture,
              email: member.email,
              teamId: member.team_id
            })) : []
          }))
        : [];
      
      setTeams(teamsData);
    } catch (err) {
      handleApiError(err, 'loading teams');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/members`);
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
      }
      const data = await response.json();
      
      const membersData = Array.isArray(data) 
        ? data.map(member => ({
            id: member.id,
            name: member.name,
            picture: member.picture,
            email: member.email,
            teamId: member.team_id
          }))
        : [];
      
      setMembers(membersData);
    } catch (err) {
      handleApiError(err, 'loading members');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: member.name,
          picture: member.picture,
          email: member.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create member: ${response.status}`);
      }
      
      await loadMembers();
    } catch (err) {
      handleApiError(err, 'creating member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (team: Omit<Team, 'id' | 'members'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: team.name,
          logo: team.logo,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create team: ${response.status}`);
      }
      
      await loadTeams();
    } catch (err) {
      handleApiError(err, 'creating team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignMemberToTeam = async (memberId: string, teamId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/teams/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: memberId,
          team_id: teamId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to assign member to team: ${response.status}`);
      }
      
      await Promise.all([loadMembers(), loadTeams()]);
    } catch (err) {
      handleApiError(err, 'assigning member to team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: feedback.content,
          target_type: feedback.targetType,
          target_id: feedback.targetId,
          target_name: feedback.targetName,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create feedback: ${response.status}`);
      }
      
      const newFeedback: Feedback = {
        ...feedback,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      setFeedbacks(prev => [...prev, newFeedback]);
    } catch (err) {
      handleApiError(err, 'creating feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadTeams(), loadMembers()]);
  }, []);

  return (
    <AppContext.Provider value={{
      members,
      teams,
      feedbacks,
      loading,
      error,
      addMember,
      addTeam,
      assignMemberToTeam,
      addFeedback,
      loadTeams,
      loadMembers,
    }}>
      {children}
    </AppContext.Provider>
  );
};