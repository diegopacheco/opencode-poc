import { useState } from 'react';
import { useAppContext } from '../appContext';

const AddTeamMember: React.FC = () => {
  const { addMember } = useAppContext();
  const [name, setName] = useState('');
  const [picture, setPicture] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      addMember({
        name: name.trim(),
        picture: picture.trim() || '/default-avatar.png',
        email: email.trim(),
      });
      setName('');
      setPicture('');
      setEmail('');
    }
  };

  return (
    <div className="page">
      <h1>Add Team Member</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="picture">Picture URL:</label>
          <input
            type="url"
            id="picture"
            value={picture}
            onChange={(e) => setPicture(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Add Member
        </button>
      </form>
    </div>
  );
};

export default AddTeamMember;