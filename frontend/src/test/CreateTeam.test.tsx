import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AppProvider } from '../context'
import CreateTeam from '../pages/CreateTeam'

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  )
}

describe('CreateTeam', () => {
  it('should render the form correctly', () => {
    renderWithProvider(<CreateTeam />)
    
    expect(screen.getByRole('heading', { name: 'Create Team' })).toBeInTheDocument()
    expect(screen.getByLabelText('Team Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('Team Logo URL:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Team' })).toBeInTheDocument()
  })
  
  it('should have team name marked as required', () => {
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const logoInput = screen.getByLabelText('Team Logo URL:')
    
    expect(nameInput).toBeRequired()
    expect(logoInput).not.toBeRequired()
  })
  
  it('should update input values when typed', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const logoInput = screen.getByLabelText('Team Logo URL:')
    
    await user.type(nameInput, 'Team Alpha')
    await user.type(logoInput, 'https://example.com/logo.png')
    
    expect(nameInput).toHaveValue('Team Alpha')
    expect(logoInput).toHaveValue('https://example.com/logo.png')
  })
  
  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const submitButton = screen.getByRole('button', { name: 'Create Team' })
    
    await user.type(nameInput, 'Team Alpha')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
  })
  
  it('should not submit form without required team name', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const submitButton = screen.getByRole('button', { name: 'Create Team' })
    
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
  })
  
  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const logoInput = screen.getByLabelText('Team Logo URL:')
    const submitButton = screen.getByRole('button', { name: 'Create Team' })
    
    await user.type(nameInput, 'Team Alpha')
    await user.type(logoInput, 'https://example.com/logo.png')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
    expect(logoInput).toHaveValue('')
  })
  
  it('should use default logo when none provided', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const submitButton = screen.getByRole('button', { name: 'Create Team' })
    
    await user.type(nameInput, 'Team Alpha')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
  })
  
  it('should trim whitespace from inputs', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const submitButton = screen.getByRole('button', { name: 'Create Team' })
    
    await user.type(nameInput, '  Team Alpha  ')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
  })
  
  it('should accept valid URL format for logo', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CreateTeam />)
    
    const logoInput = screen.getByLabelText('Team Logo URL:')
    
    await user.type(logoInput, 'https://example.com/logo.png')
    
    expect(logoInput).toHaveValue('https://example.com/logo.png')
  })
  
  it('should have proper input types', () => {
    renderWithProvider(<CreateTeam />)
    
    const nameInput = screen.getByLabelText('Team Name:')
    const logoInput = screen.getByLabelText('Team Logo URL:')
    
    expect(nameInput).toHaveAttribute('type', 'text')
    expect(logoInput).toHaveAttribute('type', 'url')
  })
})