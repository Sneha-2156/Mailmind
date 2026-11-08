import { useState, useEffect, useCallback, useRef } from 'react'
import { emailsApi } from '@/api/emails'
import { useEmailStore } from '@/stores/emailStore'
import type { Email, Priority } from '@/types'

export const useEmails = () => {
  const { emails, setEmails, updateEmail, filters, pagination, setPagination } = useEmailStore()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchEmails = useCallback(
    async (pageToLoad = 1, append = false) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await emailsApi.listEmails({
          page: pageToLoad,
          page_size: pagination.pageSize,
          search: filters.search || undefined,
          category: filters.category || undefined,
          priority: filters.priority || undefined,
          is_read: filters.is_read,
          is_important: filters.is_important,
          is_spam: filters.is_spam,
          sort: filters.sort || 'newest',
        })

        const data = response.data
        if (append) {
          setEmails([...emails, ...data.items])
        } else {
          setEmails(data.items)
        }

        setPagination({
          page: data.page,
          pageSize: data.page_size,
          total: data.total,
          hasNext: data.has_next,
        })
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch emails'
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [emails, filters, pagination.pageSize, setEmails, setPagination]
  )

  // Debounced search / filter change effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchEmails(1, false)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.search, filters.category, filters.priority, filters.is_read, filters.is_important, filters.is_spam, filters.sort])

  const loadMore = useCallback(() => {
    if (!isLoading && pagination.hasNext) {
      fetchEmails(pagination.page + 1, true)
    }
  }, [isLoading, pagination.hasNext, pagination.page, fetchEmails])

  const markRead = useCallback(
    async (id: string, is_read = true) => {
      updateEmail(id, { is_read })
      try {
        await emailsApi.markRead(id, is_read)
      } catch (err) {
        console.error('Failed to update read status on server:', err)
      }
    },
    [updateEmail]
  )

  const markImportant = useCallback(
    async (id: string, is_important = true) => {
      updateEmail(id, { is_important })
      try {
        await emailsApi.markImportant(id, is_important)
      } catch (err) {
        console.error('Failed to update important status on server:', err)
      }
    },
    [updateEmail]
  )

  const markSpam = useCallback(
    async (id: string) => {
      updateEmail(id, { is_spam: true })
      try {
        await emailsApi.markSpam(id)
      } catch (err) {
        console.error('Failed to mark email as spam on server:', err)
      }
    },
    [updateEmail]
  )

  const updateCategory = useCallback(
    async (id: string, category: string) => {
      updateEmail(id, { category })
      try {
        await emailsApi.updateCategory(id, category)
      } catch (err) {
        console.error('Failed to update category on server:', err)
      }
    },
    [updateEmail]
  )

  const updatePriority = useCallback(
    async (id: string, priority: Priority) => {
      updateEmail(id, { priority })
      try {
        await emailsApi.updatePriority(id, priority)
      } catch (err) {
        console.error('Failed to update priority on server:', err)
      }
    },
    [updateEmail]
  )

  return {
    emails,
    isLoading,
    error,
    refetch: () => fetchEmails(1, false),
    loadMore,
    markRead,
    markImportant,
    markSpam,
    updateCategory,
    updatePriority,
  }
}
