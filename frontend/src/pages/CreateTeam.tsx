import { useState } from 'react';
import { useAppContext } from '../appContext';

const CreateTeam: React.FC = () => {
  const { addTeam } = useAppContext();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateTeamName = (name: string): string => {
    if (!name.trim()) return 'Team name is required';
    if (name.trim().length < 2) return 'Team name must be at least 2 characters';
    if (name.trim().length > 50) return 'Team name must be less than 50 characters';
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) return 'Team name contains invalid characters';
    return '';
  };

  const validateLogoUrl = (url: string): string => {
    if (!url.trim()) return '';
    try {
      new URL(url.trim());
      if (!/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url.trim())) {
        return 'Logo URL must be a valid image format (jpg, png, gif, svg, webp)';
      }
      return '';
    } catch {
      return 'Logo URL is not valid';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nameError = validateTeamName(name);
    const logoError = validateLogoUrl(logo);

    if (nameError) {
      setError(nameError);
      return;
    }
    
    if (logoError) {
      setError(logoError);
      return;
    }

    setLoading(true);
    try {
      addTeam({
        name: name.trim(),
        logo: logo.trim() || '/default-team-logo.png',
      });
      setName('');
      setLogo('');
      setSuccess('Team created successfully!');
    } catch {
      setError('Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (error) {
      const nameError = validateTeamName(value);
      if (!nameError) setError('');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLogo(value);
    if (error) {
      const logoError = validateLogoUrl(value);
      if (!logoError) setError('');
    }
  };

  return (
    <div className="page">
      <h1>Create Team</h1>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-group">
          <label htmlFor="teamName">Team Name:</label>
          <input
            type="text"
            id="teamName"
            value={name}
            onChange={handleNameChange}
            required
            className="form-input"
            disabled={loading}
            maxLength={50}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="teamLogo">Team Logo URL:</label>
          <input
            type="url"
            id="teamLogo"
            value={logo}
            onChange={handleLogoChange}
            placeholder="https://example.com/logo.png"
            className="form-input"
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
};

export default CreateTeam;