import { useState } from 'react';
import { useAppContext } from '../appContext';

const GiveFeedback: React.FC = () => {
  const { members, teams, feedbacks, addFeedback } = useAppContext();
  const [targetType, setTargetType] = useState<'team' | 'member'>('member');
  const [targetId, setTargetId] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetId && content.trim()) {
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
      }
    }
  };

  const targets = targetType === 'team' ? teams : members;

  return (
    <div className="page">
      <h1>Give Feedback</h1>
      
      <form onSubmit={handleSubmit} className="form">
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
                }}
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
                }}
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
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            className="form-textarea"
            placeholder="Enter your feedback here..."
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Submit Feedback
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