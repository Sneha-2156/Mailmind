import { create } from 'zustand'
import type { Email, EmailDetail, EmailFilter, PaginationState } from '@/types'

interface EmailState {
  emails: Email[]
  selectedEmail: EmailDetail | null
  filters: EmailFilter
  pagination: PaginationState
  isSyncing: boolean

  setEmails: (emails: Email[]) => void
  setSelectedEmail: (email: EmailDetail | null) => void
  updateEmail: (id: string, updates: Partial<Email>) => void
  setFilter: (filter: Partial<EmailFilter>) => void
  resetFilters: () => void
  setPagination: (pagination: Partial<PaginationState>) => void
  setSyncing: (syncing: boolean) => void
}

const initialFilters: EmailFilter = {
  search: '',
  category: undefined,
  priority: undefined,
  is_read: undefined,
  is_important: undefined,
  is_spam: false,
  sort: 'newest',
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 20,
  total: 0,
  hasNext: false,
}

export const useEmailStore = create<EmailState>((set) => ({
  emails: [],
  selectedEmail: null,
  filters: initialFilters,
  pagination: initialPagination,
  isSyncing: false,

  setEmails: (emails) => set({ emails }),

  setSelectedEmail: (email) => set({ selectedEmail: email }),

  updateEmail: (id, updates) =>
    set((state) => ({
      emails: state.emails.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      selectedEmail:
        state.selectedEmail && state.selectedEmail.id === id
          ? { ...state.selectedEmail, ...updates }
          : state.selectedEmail,
    })),

  setFilter: (filterUpdates) =>
    set((state) => ({
      filters: { ...state.filters, ...filterUpdates },
      pagination: { ...state.pagination, page: 1 }, // Reset to page 1 on filter change
    })),

  resetFilters: () =>
    set({
      filters: initialFilters,
      pagination: { ...initialPagination, page: 1 },
    }),

  setPagination: (paginationUpdates) =>
    set((state) => ({
      pagination: { ...state.pagination, ...paginationUpdates },
    })),

  setSyncing: (isSyncing) => set({ isSyncing }),
}))
