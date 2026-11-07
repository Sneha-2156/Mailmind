export const formatCategory = (category: string | null | undefined): string => {
  if (!category) return 'Uncategorized'
  return category.trim()
}

export const formatPriority = (priority: string | null | undefined): string => {
  if (!priority) return 'Normal'
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
}

export const formatOpportunityType = (type: string | null | undefined): string => {
  if (!type) return 'Opportunity'
  switch (type.toLowerCase()) {
    case 'internship':
      return 'Internship'
    case 'job':
      return 'Full-time Job'
    case 'hackathon':
      return 'Hackathon'
    case 'scholarship':
      return 'Scholarship'
    case 'workshop':
      return 'Workshop'
    case 'certification':
      return 'Certification'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return 'New'
  switch (status.toLowerCase()) {
    case 'new':
      return 'New'
    case 'saved':
      return 'Saved'
    case 'applied':
      return 'Applied'
    case 'assessment':
      return 'Assessment'
    case 'interview':
      return 'Interview'
    case 'rejected':
      return 'Archived'
    case 'offer':
      return 'Offer Received'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '…'
}

export const formatSenderInitials = (name: string | null | undefined, email: string | null | undefined): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  if (email && email.trim()) {
    const local = email.split('@')[0]
    return local.slice(0, 2).toUpperCase()
  }

  return 'MM'
}

export const getAvatarColor = (initials: string): string => {
  const colors = [
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-sky-600 text-white',
    'bg-violet-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white',
    'bg-fuchsia-600 text-white',
  ]

  let hash = 0
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
