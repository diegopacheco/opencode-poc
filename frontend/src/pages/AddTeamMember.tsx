import { useState } from 'react';
import { useAppContext } from '../appContext';

const AddTeamMember: React.FC = () => {
  const { addMember } = useAppContext();
  const [name, setName] = useState('');
  const [picture, setPicture] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) return 'Name contains invalid characters';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return '';
  };

  const validatePictureUrl = (url: string): string => {
    if (!url.trim()) return '';
    try {
      new URL(url.trim());
      if (!/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url.trim())) {
        return 'Picture URL must be a valid image format (jpg, png, gif, svg, webp)';
      }
      return '';
    } catch {
      return 'Picture URL is not valid';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const pictureError = validatePictureUrl(picture);

    if (nameError) {
      setError(nameError);
      return;
    }
    
    if (emailError) {
      setError(emailError);
      return;
    }
    
    if (pictureError) {
      setError(pictureError);
      return;
    }

    setLoading(true);
    try {
      await addMember({
        name: name.trim(),
        picture: picture.trim() || '/default-avatar.png',
        email: email.trim(),
      });
      setName('');
      setPicture('');
      setEmail('');
      setSuccess('Team member added successfully!');
    } catch {
      setError('Failed to add team member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (error) {
      const nameError = validateName(value);
      if (!nameError) setError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (error) {
      const emailError = validateEmail(value);
      if (!emailError) setError('');
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPicture(value);
    if (error) {
      const pictureError = validatePictureUrl(value);
      if (!pictureError) setError('');
    }
  };

  return (
    <div className="page">
      <h1>Add Team Member</h1>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            required
            className="form-input"
            disabled={loading}
            maxLength={50}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="picture">Picture URL:</label>
          <input
            type="url"
            id="picture"
            value={picture}
            onChange={handlePictureChange}
            placeholder="https://example.com/avatar.jpg"
            className="form-input"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="form-input"
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
};

export default AddTeamMember;