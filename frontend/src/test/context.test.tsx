import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AppProvider } from '../context'
import { useAppContext } from '../appContext'
import type { TeamMember, Team, Feedback } from '../types'

const TestComponent = () => {
  const { 
    members, 
    teams, 
    feedbacks, 
    addMember, 
    addTeam, 
    assignMemberToTeam, 
    addFeedback 
  } = useAppContext()

  return (
    <div>
      <div data-testid="members-count">{members.length}</div>
      <div data-testid="teams-count">{teams.length}</div>
      <div data-testid="feedbacks-count">{feedbacks.length}</div>
      
      <button 
        data-testid="add-member-btn"
        onClick={() => addMember({
          name: 'John Doe',
          email: 'john@example.com',
          picture: 'avatar.jpg'
        })}
      >
        Add Member
      </button>
      
      <button 
        data-testid="add-team-btn"
        onClick={() => addTeam({
          name: 'Team Alpha',
          logo: 'logo.jpg'
        })}
      >
        Add Team
      </button>
      
      <button 
        data-testid="assign-member-btn"
        onClick={() => {
          if (members.length > 0 && teams.length > 0) {
            assignMemberToTeam(members[0].id, teams[0].id)
          }
        }}
      >
        Assign Member
      </button>
      
      <button 
        data-testid="add-feedback-btn"
        onClick={() => {
          if (members.length > 0) {
            addFeedback({
              content: 'Great work!',
              targetType: 'member',
              targetId: members[0].id,
              targetName: members[0].name
            })
          }
        }}
      >
        Add Feedback
      </button>
      
      {members.map(member => (
        <div key={member.id} data-testid={`member-${member.id}`}>
          {member.name} - {member.email} - Team: {member.teamId || 'None'}
        </div>
      ))}
      
      {teams.map(team => (
        <div key={team.id} data-testid={`team-${team.id}`}>
          {team.name} - Members: {team.members.length}
        </div>
      ))}
      
      {feedbacks.map(feedback => (
        <div key={feedback.id} data-testid={`feedback-${feedback.id}`}>
          {feedback.content} - Target: {feedback.targetName}
        </div>
      ))}
    </div>
  )
}

describe('AppContext', () => {
  it('should provide initial empty state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    expect(screen.getByTestId('members-count')).toHaveTextContent('0')
    expect(screen.getByTestId('teams-count')).toHaveTextContent('0')
    expect(screen.getByTestId('feedbacks-count')).toHaveTextContent('0')
  })
  
  it('should add a team member', async () => {
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    await user.click(screen.getByTestId('add-member-btn'))
    
    expect(screen.getByTestId('members-count')).toHaveTextContent('1')
    expect(screen.getByText('John Doe - john@example.com - Team: None')).toBeInTheDocument()
  })
  
  it('should add a team', async () => {
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    await user.click(screen.getByTestId('add-team-btn'))
    
    expect(screen.getByTestId('teams-count')).toHaveTextContent('1')
    expect(screen.getByText('Team Alpha - Members: 0')).toBeInTheDocument()
  })
  
  it('should assign member to team', async () => {
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    await user.click(screen.getByTestId('add-member-btn'))
    await user.click(screen.getByTestId('add-team-btn'))
    await user.click(screen.getByTestId('assign-member-btn'))
    
    expect(screen.getByText(/John Doe - john@example.com - Team: /)).toBeInTheDocument()
    expect(screen.getByText('Team Alpha - Members: 1')).toBeInTheDocument()
  })
  
  it('should add feedback', async () => {
    const user = userEvent.setup()
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )
    
    await user.click(screen.getByTestId('add-member-btn'))
    await user.click(screen.getByTestId('add-feedback-btn'))
    
    expect(screen.getByTestId('feedbacks-count')).toHaveTextContent('1')
    expect(screen.getByText('Great work! - Target: John Doe')).toBeInTheDocument()
  })
  
  it('should throw error when useAppContext is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      useAppContext()
      return <div>Test</div>
    }
    
    expect(() => {
      render(<TestComponentWithoutProvider />)
    }).toThrow('useAppContext must be used within an AppProvider')
  })
})