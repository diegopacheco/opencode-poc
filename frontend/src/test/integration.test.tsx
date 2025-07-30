import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('Integration Tests - Basic Workflows', () => {
  it('should allow adding a team member and navigating between pages', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    expect(screen.getByRole('heading', { name: 'Add Team Member' })).toBeInTheDocument()
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const submitBtn = screen.getByRole('button', { name: 'Add Member' })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitBtn)
    
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })
  
  it('should navigate between all pages', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const createTeamBtn = screen.getByRole('button', { name: 'Create Team' })
    const assignTeamBtn = screen.getByRole('button', { name: 'Assign to Team' })
    const giveFeedbackBtn = screen.getByRole('button', { name: 'Give Feedback' })
    const addMemberBtn = screen.getByRole('button', { name: 'Add Team Member' })
    
    await user.click(createTeamBtn)
    expect(screen.getByRole('heading', { name: 'Create Team' })).toBeInTheDocument()
    
    await user.click(assignTeamBtn)
    expect(screen.getByRole('heading', { name: 'Assign to Team' })).toBeInTheDocument()
    
    await user.click(giveFeedbackBtn)
    expect(screen.getByRole('heading', { name: 'Give Feedback' })).toBeInTheDocument()
    
    await user.click(addMemberBtn)
    expect(screen.getByRole('heading', { name: 'Add Team Member' })).toBeInTheDocument()
  })
  
  it('should maintain navigation state correctly', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const addMemberBtn = screen.getByRole('button', { name: 'Add Team Member' })
    const createTeamBtn = screen.getByRole('button', { name: 'Create Team' })
    
    expect(addMemberBtn).toHaveClass('active')
    expect(createTeamBtn).not.toHaveClass('active')
    
    await user.click(createTeamBtn)
    
    expect(addMemberBtn).not.toHaveClass('active')
    expect(createTeamBtn).toHaveClass('active')
  })
  
  it('should show appropriate messages for empty states', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const assignTeamBtn = screen.getByRole('button', { name: 'Assign to Team' })
    await user.click(assignTeamBtn)
    
    expect(screen.getByText('No unassigned members available.')).toBeInTheDocument()
    expect(screen.getByText('No teams created yet.')).toBeInTheDocument()
    
    const giveFeedbackBtn = screen.getByRole('button', { name: 'Give Feedback' })
    await user.click(giveFeedbackBtn)
    
    expect(screen.getByText('No feedback given yet.')).toBeInTheDocument()
  })
  
  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    let submitBtn = screen.getByRole('button', { name: 'Add Member' })
    await user.click(submitBtn)
    expect(screen.getByLabelText('Name:')).toBeInvalid()
    
    const createTeamBtn = screen.getByRole('button', { name: 'Create Team' })
    await user.click(createTeamBtn)
    
    submitBtn = screen.getByRole('button', { name: /Create Team$/ })
    await user.click(submitBtn)
    expect(screen.getByLabelText('Team Name:')).toBeInvalid()
  })
})