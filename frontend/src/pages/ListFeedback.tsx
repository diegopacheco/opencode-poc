import { useState, useEffect } from 'react';
import { useAppContext } from '../appContext';
import type { Feedback, Team, TeamMember } from '../types';

const ListFeedback = () => {
  const { teams, members } = useAppContext();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'team' | 'member'>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, filterType, selectedTarget]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/v1/feedbacks');
      if (!response.ok) {
        throw new Error(`Failed to fetch feedbacks: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform backend data to frontend format
      const validFeedbacks = Array.isArray(data) 
        ? data
            .filter(item => 
              item && 
              typeof item === 'object' && 
              item.id &&
              typeof item.target_type === 'string'
            )
            .map(item => ({
              id: item.id,
              content: item.content,
              targetType: item.target_type,
              targetId: item.target_id,
              targetName: item.target_name,
              createdAt: new Date(item.created_at)
            }))
        : [];
      
      setFeedbacks(validFeedbacks);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          setError('Cannot connect to the backend server. Please make sure the backend is running.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    let filtered = feedbacks.filter(feedback => 
      feedback && 
      feedback.id && 
      typeof feedback.targetType === 'string'
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(feedback => feedback.targetType === filterType);
    }

    if (selectedTarget) {
      filtered = filtered.filter(feedback => feedback.targetId === selectedTarget);
    }

    setFilteredFeedbacks(filtered);
  };

  const getTargetOptions = () => {
    if (filterType === 'team') {
      return teams;
    } else if (filterType === 'member') {
      return members;
    }
    return [];
  };

  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="page">
        <h2>Loading Feedbacks...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h2>Error</h2>
        <p className="error">{error}</p>
        <button onClick={fetchFeedbacks} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Feedback List</h2>
      
      <div className="filters">
        <div className="form-group">
          <label htmlFor="filterType">Filter by Type:</label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'all' | 'team' | 'member');
              setSelectedTarget('');
            }}
            className="form-input"
          >
            <option value="all">All</option>
            <option value="team">Teams</option>
            <option value="member">Members</option>
          </select>
        </div>

        {filterType !== 'all' && (
          <div className="form-group">
            <label htmlFor="selectedTarget">
              Select {filterType === 'team' ? 'Team' : 'Member'}:
            </label>
            <select
              id="selectedTarget"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="form-input"
            >
              <option value="">All {filterType}s</option>
              {getTargetOptions().map((option: Team | TeamMember) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="feedback-stats">
        <p>
          Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
        </p>
      </div>

      <div className="feedback-list">
        {filteredFeedbacks.length === 0 ? (
          <p className="no-data">No feedbacks found.</p>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <span className={`feedback-type ${feedback.targetType || 'unknown'}`}>
                  {(feedback.targetType || 'UNKNOWN').toUpperCase()}
                </span>
                <span className="feedback-target">{feedback.targetName || 'N/A'}</span>
                <span className="feedback-date">
                  {formatDate(feedback.createdAt)}
                </span>
              </div>
              <div className="feedback-content">
                {feedback.content || 'No content available'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListFeedback;