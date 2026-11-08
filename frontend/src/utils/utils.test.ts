import { describe, expect, it } from 'vitest'
import { isDueSoon, isOverdue, parseSafeDate } from './date'
import { formatSenderInitials, truncateText } from './format'

const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

describe('date utils', () => {
  it('parseSafeDate returns null for empty or invalid input', () => {
    expect(parseSafeDate(null)).toBeNull()
    expect(parseSafeDate(undefined)).toBeNull()
    expect(parseSafeDate('not-a-date')).toBeNull()
  })

  it('parseSafeDate parses ISO strings', () => {
    expect(parseSafeDate('2026-11-15T10:00:00Z')?.getUTCFullYear()).toBe(2026)
  })

  it('isOverdue is true for past dates, false for future or missing', () => {
    expect(isOverdue(daysFromNow(-3))).toBe(true)
    expect(isOverdue(daysFromNow(3))).toBe(false)
    expect(isOverdue(null)).toBe(false)
  })

  it('isDueSoon respects the window and excludes overdue items', () => {
    expect(isDueSoon(daysFromNow(2))).toBe(true)
    expect(isDueSoon(daysFromNow(10))).toBe(false)
    expect(isDueSoon(daysFromNow(-2))).toBe(false)
  })
})

describe('format utils', () => {
  it('truncateText leaves short text and truncates long text with an ellipsis', () => {
    expect(truncateText('short', 10)).toBe('short')
    expect(truncateText('abcdefghij', 5)).toBe('abcde…')
    expect(truncateText(null, 5)).toBe('')
  })

  it('formatSenderInitials prefers name, falls back to email, then default', () => {
    expect(formatSenderInitials('Priya Sharma', 'p@x.com')).toBe('PS')
    expect(formatSenderInitials('Madonna', null)).toBe('MA')
    expect(formatSenderInitials('', 'zed@x.com')).toBe('ZE')
    expect(formatSenderInitials(null, null)).toBe('MM')
  })
})
