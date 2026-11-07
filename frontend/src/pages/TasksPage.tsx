import React, { useEffect, useState } from 'react'
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { tasksApi } from '@/api/tasks'
import type { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PriorityBadge } from '@/components/email/PriorityBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'
import { formatEmailDate } from '@/utils/date'

export const TasksPage: React.FC = () => {
  const toast = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  // New task form state
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const res = await tasksApi.listTasks()
      setTasks(res.data)
    } catch {
      toast.error('Failed to load tasks.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleToggleComplete = async (taskId: string) => {
    try {
      const res = await tasksApi.toggleComplete(taskId)
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)))
      toast.success(res.data.is_completed ? 'Task completed!' : 'Task reopened.')
    } catch {
      toast.error('Failed to update task status.')
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Task title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await tasksApi.createTask({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
        priority: newPriority,
      })
      setTasks([res.data, ...tasks])
      toast.success('Task created successfully!')
      setIsCreateModalOpen(false)
      setNewTitle('')
      setNewDescription('')
      setNewDueDate('')
    } catch {
      toast.error('Failed to create task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    try {
      await tasksApi.deleteTask(taskToDelete)
      setTasks(tasks.filter((t) => t.id !== taskToDelete))
      toast.success('Task deleted.')
    } catch {
      toast.error('Failed to delete task.')
    } finally {
      setTaskToDelete(null)
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending') return !t.is_completed
    if (filterStatus === 'completed') return t.is_completed
    return true
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Tasks & Deadlines
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Action items and submission deadlines automatically extracted from your emails.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterStatus === 'pending'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Pending ({tasks.filter((t) => !t.is_completed).length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterStatus === 'completed'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Completed ({tasks.filter((t) => t.is_completed).length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterStatus === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All ({tasks.length})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium">No tasks found in this view.</p>
            <p className="text-xs text-slate-400 mt-1">Sync your inbox or create a task manually above.</p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 transition-all shadow-xs ${
                task.is_completed ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {task.is_completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="space-y-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      task.is_completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pt-1">
                    {task.due_date && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" /> Due {formatEmailDate(task.due_date)}
                      </span>
                    )}
                    <PriorityBadge priority={task.priority as any} />
                    {task.confidence && (
                      <span className="text-[10px] text-slate-400">
                        {Math.round(task.confidence * 100)}% AI confidence
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTaskToDelete(task.id)}
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Actionable Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Task Title *
            </label>
            <Input
              placeholder="e.g. Submit Google internship coding test"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add relevant notes or requirements..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  )
}
