import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
const now = () => new Date().toISOString()

export const useStore = create(
  persist(
    (set) => ({
      events: [],
      addEvent: (data) =>
        set((s) => ({
          events: [...s.events, { ...data, id: genId(), createdAt: now(), updatedAt: now() }],
        })),
      updateEvent: (id, data) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...data, updatedAt: now() } : e)),
        })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      toggleStatus: (id) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== id) return e
            const next = e.status === 'done' ? 'pending' : 'done'
            return { ...e, status: next, updatedAt: now(), ...(next === 'done' ? { completedAt: now() } : {}) }
          }),
        })),
    }),
    { name: 'day-planner-store' }
  )
)
