import { format, parseISO, isToday, isYesterday, isTomorrow, differenceInDays, isBefore, startOfDay } from 'date-fns'

export const parseSafeDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null
  try {
    const d = parseISO(dateStr)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

export const formatEmailDate = (dateStr: string | null | undefined): string => {
  const date = parseSafeDate(dateStr)
  if (!date) return ''

  if (isToday(date)) {
    return format(date, 'h:mm a')
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  const currentYear = new Date().getFullYear()
  if (date.getFullYear() === currentYear) {
    return format(date, 'MMM d')
  }

  return format(date, 'MMM d, yyyy')
}

export const formatDeadline = (dateStr: string | null | undefined): string => {
  const date = parseSafeDate(dateStr)
  if (!date) return 'No deadline'

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`
  }

  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  return format(date, 'MMM d, yyyy')
}

export const isOverdue = (dateStr: string | null | undefined): boolean => {
  const date = parseSafeDate(dateStr)
  if (!date) return false
  return isBefore(date, startOfDay(new Date()))
}

export const isDueSoon = (dateStr: string | null | undefined, days = 3): boolean => {
  const date = parseSafeDate(dateStr)
  if (!date) return false

  const today = startOfDay(new Date())
  const targetDate = startOfDay(date)

  if (isBefore(targetDate, today)) {
    return false // Already overdue
  }

  const diff = differenceInDays(targetDate, today)
  return diff >= 0 && diff <= days
}

export const formatRelativeTime = (dateStr: string | null | undefined): string => {
  const date = parseSafeDate(dateStr)
  if (!date) return ''

  const now = new Date()
  const diffDays = differenceInDays(now, date)

  if (diffDays === 0) {
    return format(date, 'h:mm a')
  }
  if (diffDays === 1) {
    return '1d ago'
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return format(date, 'MMM d')
}
