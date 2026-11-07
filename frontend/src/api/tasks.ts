import client from './client'
import type { Task } from '@/types'

export interface ListTasksParams {
  is_completed?: boolean
  priority?: string
  due_soon?: boolean
  search?: string
}

export interface CreateTaskData {
  title: string
  description?: string | null
  due_date?: string | null
  event_date?: string | null
  organization?: string | null
  priority?: string
  email_id?: string | null
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  is_completed?: boolean
  is_date_uncertain?: boolean
}

export const tasksApi = {
  listTasks: (params?: ListTasksParams) =>
    client.get<Task[]>('/api/v1/tasks', { params }),

  createTask: (data: CreateTaskData) =>
    client.post<Task>('/api/v1/tasks', data),

  updateTask: (id: string, data: UpdateTaskData) =>
    client.patch<Task>(`/api/v1/tasks/${id}`, data),

  deleteTask: (id: string) =>
    client.delete<{ message: string }>(`/api/v1/tasks/${id}`),

  toggleComplete: (id: string) =>
    client.patch<Task>(`/api/v1/tasks/${id}/complete`),
}
