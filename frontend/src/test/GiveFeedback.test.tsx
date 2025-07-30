import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AppProvider } from '../context'
import { useAppContext } from '../appContext'
import GiveFeedback from '../pages/GiveFeedback'

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

describe('GiveFeedback', () => {
  it('should render the page title', () => {
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    expect(screen.getByText('Give Feedback')).toBeInTheDocument()
  })
  
  it('should render radio buttons for target type selection', () => {
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText('Team Member')).toBeInTheDocument()
    expect(screen.getByLabelText('Team')).toBeInTheDocument()
  })
  
  it('should have Team Member selected by default', () => {
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    const memberRadio = screen.getByLabelText('Team Member')
    const teamRadio = screen.getByLabelText('Team')
    
    expect(memberRadio).toBeChecked()
    expect(teamRadio).not.toBeChecked()
  })
  
  it('should switch target type when radio button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    const teamRadio = screen.getByLabelText('Team')
    
    await user.click(teamRadio)
    
    expect(teamRadio).toBeChecked()
    expect(screen.getByLabelText('Team Member')).not.toBeChecked()
  })
  
  it('should show appropriate dropdown label based on target type', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText('Select Member:')).toBeInTheDocument()
    
    const teamRadio = screen.getByLabelText('Team')
    await user.click(teamRadio)
    
    expect(screen.getByLabelText('Select Team:')).toBeInTheDocument()
  })
  
  it('should populate dropdown with available members/teams', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <GiveFeedback />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    
    const teamRadio = screen.getByLabelText('Team')
    await user.click(teamRadio)
    
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
  })
  
  it('should submit feedback successfully', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <GiveFeedback />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    
    const targetSelect = screen.getByLabelText('Select Member:')
    const feedbackTextarea = screen.getByLabelText('Feedback:')
    const submitButton = screen.getByRole('button', { name: 'Submit Feedback' })
    
    await user.selectOptions(targetSelect, screen.getByText('John Doe'))
    await user.type(feedbackTextarea, 'Great work on the project!')
    await user.click(submitButton)
    
    expect(feedbackTextarea).toHaveValue('')
  })
  
  it('should require all fields to be filled', () => {
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    const targetSelect = screen.getByLabelText('Select Member:')
    const feedbackTextarea = screen.getByLabelText('Feedback:')
    
    expect(targetSelect).toBeRequired()
    expect(feedbackTextarea).toBeRequired()
  })
  
  it('should show Recent Feedback section', () => {
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    expect(screen.getByText('Recent Feedback')).toBeInTheDocument()
    expect(screen.getByText('No feedback given yet.')).toBeInTheDocument()
  })
  
  it('should display submitted feedback in Recent Feedback', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <GiveFeedback />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    
    const targetSelect = screen.getByLabelText('Select Member:')
    const feedbackTextarea = screen.getByLabelText('Feedback:')
    const submitButton = screen.getByRole('button', { name: 'Submit Feedback' })
    
    await user.selectOptions(targetSelect, screen.getByText('John Doe'))
    await user.type(feedbackTextarea, 'Great work on the project!')
    await user.click(submitButton)
    
    expect(screen.getByText('Member: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Great work on the project!')).toBeInTheDocument()
  })
  
  it('should show correct placeholder options', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <GiveFeedback />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    expect(screen.getByText('Choose a member...')).toBeInTheDocument()
    
    const teamRadio = screen.getByLabelText('Team')
    await user.click(teamRadio)
    
    expect(screen.getByText('Choose a team...')).toBeInTheDocument()
  })
  
  it('should reset target selection when switching target type', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SetupComponent />
        <GiveFeedback />
      </TestWrapper>
    )
    
    await user.click(screen.getByTestId('setup-member'))
    await user.click(screen.getByTestId('setup-team'))
    
    const targetSelect = screen.getByLabelText('Select Member:')
    await user.selectOptions(targetSelect, screen.getByText('John Doe'))
    
    const teamRadio = screen.getByLabelText('Team')
    await user.click(teamRadio)
    
    const teamSelect = screen.getByLabelText('Select Team:')
    expect(teamSelect).toHaveValue('')
  })
  
  it('should have proper textarea attributes', () => {
    render(
      <TestWrapper>
        <GiveFeedback />
      </TestWrapper>
    )
    
    const feedbackTextarea = screen.getByLabelText('Feedback:')
    
    expect(feedbackTextarea).toHaveAttribute('rows', '5')
    expect(feedbackTextarea).toHaveAttribute('placeholder', 'Enter your feedback here...')
  })
})