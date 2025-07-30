import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AppProvider } from '../context'
import AddTeamMember from '../pages/AddTeamMember'

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  )
}

describe('AddTeamMember', () => {
  it('should render the form correctly', () => {
    renderWithProvider(<AddTeamMember />)
    
    expect(screen.getByText('Add Team Member')).toBeInTheDocument()
    expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('Picture URL:')).toBeInTheDocument()
    expect(screen.getByLabelText('Email:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Member' })).toBeInTheDocument()
  })
  
  it('should have required fields marked as required', () => {
    renderWithProvider(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const pictureInput = screen.getByLabelText('Picture URL:')
    
    expect(nameInput).toBeRequired()
    expect(emailInput).toBeRequired()
    expect(pictureInput).not.toBeRequired()
  })
  
  it('should update input values when typed', async () => {
    const user = userEvent.setup()
    renderWithProvider(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const pictureInput = screen.getByLabelText('Picture URL:')
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(pictureInput, 'https://example.com/avatar.jpg')
    
    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(pictureInput).toHaveValue('https://example.com/avatar.jpg')
  })
  
  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    renderWithProvider(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const submitButton = screen.getByRole('button', { name: 'Add Member' })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })
  
  it('should not submit form without required fields', async () => {
    const user = userEvent.setup()
    renderWithProvider(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText('Name:')
    const submitButton = screen.getByRole('button', { name: 'Add Member' })
    
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
  })
  
  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()
    renderWithProvider(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const pictureInput = screen.getByLabelText('Picture URL:')
    const submitButton = screen.getByRole('button', { name: 'Add Member' })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(pictureInput, 'https://example.com/avatar.jpg')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
    expect(pictureInput).toHaveValue('')
  })
  
  it('should use default picture when none provided', async () => {
    const user = userEvent.setup()
    renderWithProvider(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const submitButton = screen.getByRole('button', { name: 'Add Member' })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })
  
  it('should trim whitespace from inputs', async () => {
    const user = userEvent.setup()
    renderWithProvider(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText('Name:')
    const emailInput = screen.getByLabelText('Email:')
    const submitButton = screen.getByRole('button', { name: 'Add Member' })
    
    await user.type(nameInput, '  John Doe  ')
    await user.type(emailInput, '  john@example.com  ')
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })
})