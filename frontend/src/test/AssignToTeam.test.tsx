import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { AppProvider } from '../context'
import { useAppContext } from '../appContext'
import AssignToTeam from '../pages/AssignToTeam'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <AppProvider>{children}</AppProvider>
}

const SetupComponent = () => {
  const { addMember, addTeam } = useAppContext()
  
  return (
    <div>
      <button 
        data-testid="setup-member"
        onClick={() => addMember({
          name: 'John Doe',
          email: 'john@example.com',
          picture: 'avatar.jpg'
        })}
      >
        Add Test Member
      </button>
      <button 
        data-testid="setup-team"
        onClick={() => addTeam({
          name: 'Team Alpha',
          logo: 'logo.jpg'
        })}
      >
        Add Test Team
      </button>
    </div>
  )
}

describe('AssignToTeam', () => {
  it('should render the page title', () => {
    render(
      <TestWrapper>
        <AssignToTeam />
      </TestWrapper>
    )
    
    expect(screen.getByText('Assign to Team')).toBeInTheDocument()
  })
  
  it('should show message when no unassigned members available', () => {
    render(
      <TestWrapper>
        <AssignToTeam />
      </TestWrapper>
    )
    
    expect(screen.getByText('No unassigned members available.')).toBeInTheDocument()
  })
  
  it('should show message when no teams created', () => {
    render(
      <TestWrapper>
        <AssignToTeam />
      </TestWrapper>
    )
    
    expect(screen.getByText('No teams created yet.')).toBeInTheDocument()
  })
  
  it('should show assignment form when members and teams are available', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <AssignToTeam />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    expect(screen.getByLabelText('Select Member:')).toBeInTheDocument()
    expect(screen.getByLabelText('Select Team:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assign to Team' })).toBeInTheDocument()
  })
  
  it('should populate dropdowns with available members and teams', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <AssignToTeam />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    const memberSelect = screen.getByLabelText('Select Member:')
    const teamSelect = screen.getByLabelText('Select Team:')
    
    expect(memberSelect).toBeInTheDocument()
    expect(teamSelect).toBeInTheDocument()
    
    expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument()
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
  })
  
  it('should assign member to team successfully', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <AssignToTeam />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    const memberSelect = screen.getByLabelText('Select Member:')
    const teamSelect = screen.getByLabelText('Select Team:')
    const submitButton = screen.getByRole('button', { name: 'Assign to Team' })
    
    await user.selectOptions(memberSelect, screen.getByText('John Doe (john@example.com)'))
    await user.selectOptions(teamSelect, screen.getByText('Team Alpha'))
    await user.click(submitButton)
    
    expect(memberSelect).toHaveValue('')
    expect(teamSelect).toHaveValue('')
  })
  
  it('should show current team assignments', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <AssignToTeam />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-team'))
    
    expect(screen.getByText('Current Team Assignments')).toBeInTheDocument()
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    expect(screen.getByText('No members assigned')).toBeInTheDocument()
  })
  
  it('should require both member and team selection', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <AssignToTeam />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    const memberSelect = screen.getByLabelText('Select Member:')
    const teamSelect = screen.getByLabelText('Select Team:')
    
    expect(memberSelect).toBeRequired()
    expect(teamSelect).toBeRequired()
  })
  
  it('should show default placeholder options', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <AssignToTeam />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    expect(screen.getByText('Choose a member...')).toBeInTheDocument()
    expect(screen.getByText('Choose a team...')).toBeInTheDocument()
  })
  
  it('should update member assignment in team display', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <AssignToTeam />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    const memberSelect = screen.getByLabelText('Select Member:')
    const teamSelect = screen.getByLabelText('Select Team:')
    const submitButton = screen.getByRole('button', { name: 'Assign to Team' })
    
    await user.selectOptions(memberSelect, screen.getByText('John Doe (john@example.com)'))
    await user.selectOptions(teamSelect, screen.getByText('Team Alpha'))
    await user.click(submitButton)
    
    expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument()
  })
})