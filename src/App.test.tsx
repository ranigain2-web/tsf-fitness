import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  it('renders the product name and the three pillars', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'TSF Fitness' })).toBeTruthy()
    expect(screen.getByText('Train. Snap. Fuel.')).toBeTruthy()
  })

  it('states the current build status honestly', () => {
    render(<App />)
    const status = screen.getByTestId('build-status')
    expect(status.textContent).toContain('walking skeleton')
  })
})
