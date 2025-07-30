import { useState } from 'react';
import { useAppContext } from '../appContext';

const CreateTeam: React.FC = () => {
  const { addTeam } = useAppContext();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addTeam({
        name: name.trim(),
        logo: logo.trim() || '/default-team-logo.png',
      });
      setName('');
      setLogo('');
    }
  };

  return (
    <div className="page">
      <h1>Create Team</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="teamName">Team Name:</label>
          <input
            type="text"
            id="teamName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="teamLogo">Team Logo URL:</label>
          <input
            type="url"
            id="teamLogo"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="form-input"
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Create Team
        </button>
      </form>
    </div>
  );
};

export default CreateTeam;