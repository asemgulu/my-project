import { useState } from 'react'
import { useStore } from '../store/useStore'
import EventModal from '../components/EventModal'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import { PRIORITY_CLASSES, todayStr } from '../utils'

export default function Work() {
  const { events, addEvent, updateEvent, deleteEvent, toggleStatus } = useStore()
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [defaultType, setDefaultType] = useState(null)

  const today = todayStr()
  const workEvents = events.filter((e) => e.category === 'work')

  const meetings = workEvents
    .filter((e) => e.type === 'meeting')
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)

  const tasks = workEvents
    .filter((e) => e.type === 'task')
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 }
      if (a.status === 'done' && b.status !== 'done') return 1
      if (a.status !== 'done' && b.status === 'done') return -1
      const pd = pOrder[a.priority] - pOrder[b.priority]
      if (pd !== 0) return pd
      return a.deadline > b.deadline ? 1 : -1
    })

  const handleSave = (form) => {
    if (modal === 'add') addEvent(form)
    else updateEvent(modal.id, form)
    setModal(null)
    setDefaultType(null)
  }

  const openAdd = (type) => {
    setDefaultType(type)
    setModal('add')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">💼 Работа</h1>
        <button
          onClick={() => { setDefaultType(null); setModal('add') }}
          className="bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
        >
          + Добавить
        </button>
      </div>

      {/* Meetings */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">🤝 Встречи и совещания</h2>
          <button onClick={() => openAdd('meeting')} className="text-sm text-amber-600 hover:text-amber-800 font-medium">+ Встреча</button>
        </div>
        {meetings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Встреч нет</p>
        ) : (
          <div className="space-y-2">
            {meetings.map((e) => (
              <div key={e.id} className={`flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 group ${e.status === 'done' ? 'opacity-70' : ''}`}>
                <button
                  onClick={() => toggleStatus(e.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${e.status === 'done' ? 'bg-amber-400 border-amber-400 text-white' : 'border-gray-300 hover:border-amber-300'}`}
                >
                  {e.status === 'done' && <span className="text-[10px] leading-none">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800">{e.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {e.date} · {e.time}{e.duration ? ` · ${e.duration} мин` : ''}
                    {e.location ? ` · 📍 ${e.location}` : ''}
                  </div>
                  {e.participants && (
                    <div className="text-xs text-gray-400 mt-0.5">👥 {e.participants}</div>
                  )}
                  {e.link && (
                    <a href={e.link} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-0.5 block truncate">
                      🔗 {e.link}
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={e.status} date={e.date} time={e.time} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal(e)} className="text-xs text-gray-400 hover:text-gray-600">✎</button>
                    <button onClick={() => setConfirm(e.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">✅ Задачи</h2>
          <button onClick={() => openAdd('task')} className="text-sm text-amber-600 hover:text-amber-800 font-medium">+ Задача</button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Задач нет</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((e) => {
              const pc = PRIORITY_CLASSES[e.priority] || PRIORITY_CLASSES.medium
              return (
                <div key={e.id} className={`flex items-start gap-3 p-3 rounded-xl border group transition-opacity ${e.status === 'done' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-amber-200'}`}>
                  <button
                    onClick={() => toggleStatus(e.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${e.status === 'done' ? 'bg-amber-400 border-amber-400 text-white' : 'border-gray-300 hover:border-amber-300'}`}
                  >
                    {e.status === 'done' && <span className="text-[10px] leading-none">✓</span>}
                  </button>
                  <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${pc.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${e.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {e.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">до {e.deadline}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${pc.badge}`}>{pc.label}</span>
                    </div>
                    {e.notes && <div className="text-xs text-gray-400 mt-0.5 truncate">{e.notes}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={e.status} date={e.deadline} time="23:59" />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal(e)} className="text-xs text-gray-400 hover:text-gray-600">✎</button>
                      <button onClick={() => setConfirm(e.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <EventModal
          event={modal === 'add' ? (defaultType ? { category: 'work', type: defaultType } : null) : modal}
          onSave={handleSave}
          onClose={() => { setModal(null); setDefaultType(null) }}
        />
      )}
      {confirm && (
        <ConfirmModal
          message="Удалить запись?"
          onConfirm={() => { deleteEvent(confirm); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
