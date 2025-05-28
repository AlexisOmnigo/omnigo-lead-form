import { describe, it, expect } from 'vitest'
import { isSlotAvailable } from '../googleCalendar'

describe('isSlotAvailable', () => {
  it('returns true when slot does not overlap busy times', () => {
    const busy = [
      { start: new Date('2025-05-16T10:00:00'), end: new Date('2025-05-16T10:30:00') }
    ]
    const result = isSlotAvailable(
      new Date('2025-05-16T09:00:00'),
      new Date('2025-05-16T09:30:00'),
      busy
    )
    expect(result).toBe(true)
  })

  it('returns false when slot overlaps busy time', () => {
    const busy = [
      { start: new Date('2025-05-16T09:15:00'), end: new Date('2025-05-16T09:45:00') }
    ]
    const result = isSlotAvailable(
      new Date('2025-05-16T09:00:00'),
      new Date('2025-05-16T09:30:00'),
      busy
    )
    expect(result).toBe(false)
  })
})
