import { useState } from 'react';
import { useAppContext } from '../appContext';

const AssignToTeam: React.FC = () => {
  const { members, teams, assignMemberToTeam, loading, error } = useAppContext();
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const availableMembers = members.filter(member => !member.teamId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');
    
    if (!selectedMember || !selectedTeam) {
      setLocalError('Please select both a member and a team');
      return;
    }

    setLocalLoading(true);
    try {
      await assignMemberToTeam(selectedMember, selectedTeam);
      setSelectedMember('');
      setSelectedTeam('');
      setSuccess('Member assigned to team successfully!');
    } catch {
      setLocalError('Failed to assign member to team. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;
  const displayError = error || localError;

  return (
    <div className="page">
      <h1>Assign to Team</h1>
      
      {displayError && <div className="error-message">{displayError}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {availableMembers.length === 0 && !isLoading && (
        <p className="message">No unassigned members available.</p>
      )}
      
      {teams.length === 0 && !isLoading && (
        <p className="message">No teams created yet.</p>
      )}
      
      {availableMembers.length > 0 && teams.length > 0 && (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="member">Select Member:</label>
            <select
              id="member"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              required
              className="form-input"
              disabled={isLoading}
            >
              <option value="">Choose a member...</option>
              {availableMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="team">Select Team:</label>
            <select
              id="team"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              required
              className="form-input"
              disabled={isLoading}
            >
              <option value="">Choose a team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign to Team'}
          </button>
        </form>
      )}
      
      <div className="team-assignments">
        <h2>Current Team Assignments</h2>
        {teams.map(team => (
          <div key={team.id} className="team-card">
            <h3>{team.name}</h3>
            <div className="team-members">
              {team.members.length > 0 ? (
                team.members.map(member => (
                  <div key={member.id} className="member-item">
                    {member.name} ({member.email})
                  </div>
                ))
              ) : (
                <p className="no-members">No members assigned</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignToTeam;