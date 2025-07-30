import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('should render the navigation bar', () => {
    render(<App />)
    
    expect(screen.getByText('Coaching App')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Team Member' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Team' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assign to Team' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Give Feedback' })).toBeInTheDocument()
  })
  
  it('should render Add Team Member page by default', () => {
    render(<App />)
    
    expect(screen.getByRole('heading', { name: 'Add Team Member' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('Email:')).toBeInTheDocument()
  })
  
  it('should have Add Team Member button active by default', () => {
    render(<App />)
    
    const addMemberBtn = screen.getByRole('button', { name: 'Add Team Member' })
    expect(addMemberBtn).toHaveClass('active')
  })
  
  it('should navigate to Create Team page when button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const createTeamBtn = screen.getByRole('button', { name: 'Create Team' })
    await user.click(createTeamBtn)
    
    expect(screen.getByRole('heading', { name: 'Create Team' })).toBeInTheDocument()
    expect(screen.getByLabelText('Team Name:')).toBeInTheDocument()
    expect(createTeamBtn).toHaveClass('active')
  })
  
  it('should navigate to Assign to Team page when button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const assignTeamBtn = screen.getByRole('button', { name: 'Assign to Team' })
    await user.click(assignTeamBtn)
    
    expect(screen.getByRole('heading', { name: 'Assign to Team' })).toBeInTheDocument()
    expect(assignTeamBtn).toHaveClass('active')
  })
  
  it('should navigate to Give Feedback page when button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const giveFeedbackBtn = screen.getByRole('button', { name: 'Give Feedback' })
    await user.click(giveFeedbackBtn)
    
    expect(screen.getByRole('heading', { name: 'Give Feedback' })).toBeInTheDocument()
    expect(giveFeedbackBtn).toHaveClass('active')
  })
  
  it('should update active state when navigating between pages', async () => {
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
  
  it('should navigate back to Add Team Member page', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const createTeamBtn = screen.getByRole('button', { name: 'Create Team' })
    const addMemberBtn = screen.getByRole('button', { name: 'Add Team Member' })
    
    await user.click(createTeamBtn)
    expect(screen.getByRole('heading', { name: 'Create Team' })).toBeInTheDocument()
    
    await user.click(addMemberBtn)
    expect(screen.getByRole('heading', { name: 'Add Team Member' })).toBeInTheDocument()
    expect(addMemberBtn).toHaveClass('active')
  })
  
  it('should maintain state across page navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const nameInput = screen.getByLabelText('Name:')
    await user.type(nameInput, 'John Doe')
    
    const createTeamBtn = screen.getByRole('button', { name: 'Create Team' })
    await user.click(createTeamBtn)
    
    const addMemberBtn = screen.getByRole('button', { name: 'Add Team Member' })
    await user.click(addMemberBtn)
    
    expect(screen.getByLabelText('Name:')).toHaveValue('John Doe')
  })
  
  it('should have correct CSS classes for layout', () => {
    render(<App />)
    
    expect(document.querySelector('.app')).toBeInTheDocument()
    expect(document.querySelector('.navbar')).toBeInTheDocument()
    expect(document.querySelector('.main-content')).toBeInTheDocument()
  })
  
  it('should render all navigation buttons', () => {
    render(<App />)
    
    const buttons = screen.getAllByRole('button')
    const navButtons = buttons.filter(button => 
      button.textContent?.includes('Add Team Member') ||
      button.textContent?.includes('Create Team') ||
      button.textContent?.includes('Assign to Team') ||
      button.textContent?.includes('Give Feedback')
    )
    
    expect(navButtons).toHaveLength(4)
  })
  
  it('should provide AppProvider context to all pages', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const submitButton = screen.getByRole('button', { name: 'Add Member' })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    const assignTeamBtn = screen.getByRole('button', { name: 'Assign to Team' })
    await user.click(assignTeamBtn)
    
    expect(screen.getByText('Current Team Assignments')).toBeInTheDocument()
  })
})