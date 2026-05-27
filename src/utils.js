export function eventTitle(e) {
  if (!e) return ''
  if (e.type === 'medication') return `${e.medicationName || 'Таблетка'}${e.dosage ? ` · ${e.dosage}` : ''}`
  if (e.category === 'sport') return e.title || e.activityType || 'Тренировка'
  if (e.type === 'doctor') return `${e.specialty || 'Врач'}${e.title ? ` · ${e.title}` : ''}`
  if (e.type === 'cosmetic') return e.title || 'Процедура'
  if (e.type === 'meeting') return e.title || 'Встреча'
  if (e.type === 'task') return e.title || 'Задача'
  return e.title || ''
}

export function eventEmoji(e) {
  if (e.category === 'sport') return '🏃'
  if (e.type === 'medication') return '💊'
  if (e.type === 'doctor') return '🩺'
  if (e.type === 'cosmetic') return '💆'
  if (e.type === 'meeting') return '🤝'
  if (e.type === 'task') return '✅'
  return '📌'
}

export const CAT_CLASSES = {
  sport: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    borderLeft: 'border-l-emerald-400',
    text: 'text-emerald-600',
    solid: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    btnActive: 'border-emerald-400 bg-emerald-50 text-emerald-700',
    btnInactive: 'border-gray-200 hover:border-gray-300 text-gray-600',
    progress: 'bg-emerald-400',
  },
  health: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    borderLeft: 'border-l-blue-400',
    text: 'text-blue-500',
    solid: 'bg-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    btnActive: 'border-blue-400 bg-blue-50 text-blue-700',
    btnInactive: 'border-gray-200 hover:border-gray-300 text-gray-600',
    progress: 'bg-blue-400',
  },
  work: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    borderLeft: 'border-l-amber-400',
    text: 'text-amber-600',
    solid: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    btnActive: 'border-amber-400 bg-amber-50 text-amber-700',
    btnInactive: 'border-gray-200 hover:border-gray-300 text-gray-600',
    progress: 'bg-amber-400',
  },
}

export const PRIORITY_CLASSES = {
  high:   { dot: 'bg-red-400',    badge: 'bg-red-100 text-red-600',    label: 'Высокий' },
  medium: { dot: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-600', label: 'Средний' },
  low:    { dot: 'bg-green-400',  badge: 'bg-green-100 text-green-600', label: 'Низкий' },
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
