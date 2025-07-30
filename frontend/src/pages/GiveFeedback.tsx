import { useState } from 'react';
import { useAppContext } from '../appContext';

const GiveFeedback: React.FC = () => {
  const { members, teams, feedbacks, addFeedback } = useAppContext();
  const [targetType, setTargetType] = useState<'team' | 'member'>('member');
  const [targetId, setTargetId] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateFeedback = (content: string): string => {
    if (!content.trim()) return 'Feedback content is required';
    if (content.trim().length < 5) return 'Feedback must be at least 5 characters';
    if (content.trim().length > 1000) return 'Feedback must be less than 1000 characters';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!targetId) {
      setError('Please select a team or member');
      return;
    }

    const feedbackError = validateFeedback(content);
    if (feedbackError) {
      setError(feedbackError);
      return;
    }

    setLoading(true);
    try {
      const target = targetType === 'team' 
        ? teams.find(t => t.id === targetId)
        : members.find(m => m.id === targetId);
      
      if (target) {
        addFeedback({
          content: content.trim(),
          targetType,
          targetId,
          targetName: target.name,
        });
        setContent('');
        setTargetId('');
        setSuccess('Feedback submitted successfully!');
      } else {
        setError('Selected target not found');
      }
    } catch {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    if (error) {
      const feedbackError = validateFeedback(value);
      if (!feedbackError) setError('');
    }
  };

  const targets = targetType === 'team' ? teams : members;

  return (
    <div className="page">
      <h1>Give Feedback</h1>
      
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-group">
          <label>Feedback Target:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="targetType"
                value="member"
                checked={targetType === 'member'}
                onChange={(e) => {
                  setTargetType(e.target.value as 'member');
                  setTargetId('');
                  setError('');
                }}
                disabled={loading}
              />
              Team Member
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="targetType"
                value="team"
                checked={targetType === 'team'}
                onChange={(e) => {
                  setTargetType(e.target.value as 'team');
                  setTargetId('');
                  setError('');
                }}
                disabled={loading}
              />
              Team
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="target">
            Select {targetType === 'team' ? 'Team' : 'Member'}:
          </label>
          <select
            id="target"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            required
            className="form-input"
            disabled={loading}
          >
            <option value="">
              Choose a {targetType === 'team' ? 'team' : 'member'}...
            </option>
            {targets.map(target => (
              <option key={target.id} value={target.id}>
                {target.name}
                {targetType === 'member' && 'email' in target && ` (${target.email})`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="feedback">Feedback:</label>
          <textarea
            id="feedback"
            value={content}
            onChange={handleContentChange}
            required
            rows={5}
            className="form-textarea"
            placeholder="Enter your feedback here..."
            disabled={loading}
            maxLength={1000}
          />
          <div className="character-count">
            {content.length}/1000 characters
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
      
      <div className="feedback-history">
        <h2>Recent Feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="message">No feedback given yet.</p>
        ) : (
          <div className="feedback-list">
            {feedbacks
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map(feedback => (
                <div key={feedback.id} className="feedback-item">
                  <div className="feedback-header">
                    <strong>
                      {feedback.targetType === 'team' ? 'Team: ' : 'Member: '}
                      {feedback.targetName}
                    </strong>
                    <span className="feedback-date">
                      {feedback.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="feedback-content">{feedback.content}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiveFeedback;