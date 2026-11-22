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
    // Disclose the skeleton state...
    expect(status.textContent).toContain('walking skeleton')
    // ...and never claim an unbuilt capability in the present tense —
    // the honesty invariant the shell is built on (the camera coach and
    // food log are future work, not shipped features).
    expect(status.textContent).not.toMatch(
      /counts (your )?reps|corrects (your )?form|tracks (your )?food/i,
    )
  })
})
