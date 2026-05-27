import { useState } from 'react'
import { useStore } from '../store/useStore'
import EventModal from '../components/EventModal'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import { todayStr } from '../utils'

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function HealthSection({ title, emoji, events, onAdd, onEdit, onDelete, onToggle, renderExtra }) {
  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">{emoji} {title}</h2>
        <button
          onClick={onAdd}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium"
        >+ Добавить</button>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Нет записей</p>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.id} className={`flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 group ${e.status === 'done' ? 'opacity-70' : ''}`}>
              <button
                onClick={() => onToggle(e.id)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${e.status === 'done' ? 'bg-blue-400 border-blue-400 text-white' : 'border-gray-300 hover:border-blue-300'}`}
              >
                {e.status === 'done' && <span className="text-[10px] leading-none">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                {renderExtra ? renderExtra(e) : (
                  <>
                    <div className="font-medium text-sm text-gray-800 truncate">
                      {e.type === 'medication' ? `${e.medicationName} · ${e.dosage || ''}` : e.title || e.specialty}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {e.date}{e.time ? ` · ${e.time}` : ''}{e.location ? ` · ${e.location}` : ''}
                      {e.master ? ` · ${e.master}` : ''}{e.salon ? `, ${e.salon}` : ''}
                    </div>
                    {e.recurrence && e.recurrence !== 'once' && (
                      <span className="text-[10px] bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        {e.recurrence === 'daily' ? 'ежедневно' : 'еженедельно'}
                      </span>
                    )}
                    {e.notes && <div className="text-xs text-gray-400 mt-0.5 truncate">{e.notes}</div>}
                  </>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StatusBadge status={e.status} date={e.date} time={e.time} />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(e)} className="text-xs text-gray-400 hover:text-gray-600">✎</button>
                  <button onClick={() => onDelete(e.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Health() {
  const { events, addEvent, updateEvent, deleteEvent, toggleStatus } = useStore()
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [defaultType, setDefaultType] = useState(null)

  const today = todayStr()
  const last7 = getLast7Days()

  const healthEvents = events.filter((e) => e.category === 'health')
  const medications  = healthEvents.filter((e) => e.type === 'medication').sort((a, b) => a.time > b.time ? 1 : -1)
  const doctors      = healthEvents.filter((e) => e.type === 'doctor').sort((a, b) => a.date > b.date ? 1 : -1)
  const cosmetics    = healthEvents.filter((e) => e.type === 'cosmetic').sort((a, b) => a.date > b.date ? 1 : -1)

  // Upcoming in 24h
  const upcoming = healthEvents.filter((e) => {
    if (e.status === 'done') return false
    const dt = new Date(`${e.date}T${e.time || '00:00'}`)
    const diff = dt - new Date()
    return diff > 0 && diff < 24 * 60 * 60 * 1000
  })

  // Medication history last 7 days
  const medHistory = last7.map((date) => {
    const meds = medications.filter((e) => e.date === date)
    return { date, total: meds.length, done: meds.filter((e) => e.status === 'done').length }
  })

  const openAdd = (type) => {
    setDefaultType(type)
    setModal('add')
  }

  const handleSave = (form) => {
    if (modal === 'add') addEvent(form)
    else updateEvent(modal.id, form)
    setModal(null)
    setDefaultType(null)
  }

  const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">💊 Здоровье</h1>
        <button
          onClick={() => { setDefaultType(null); setModal('add') }}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          + Добавить
        </button>
      </div>

      {/* Upcoming alert */}
      {upcoming.length > 0 && (
        <div className="card mb-4 border-l-4 border-l-amber-400 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <span>⏰</span>
            <span className="font-semibold text-amber-800">Ближайшие 24 часа ({upcoming.length})</span>
          </div>
          <div className="space-y-1">
            {upcoming.map((e) => (
              <div key={e.id} className="text-sm text-amber-700">
                {e.time} — {e.type === 'medication' ? e.medicationName : (e.specialty || e.title)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication history */}
      {medications.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">📅 История приёма (7 дней)</h2>
          <div className="grid grid-cols-7 gap-1">
            {medHistory.map(({ date, total, done }) => {
              const d = new Date(date)
              const dayIdx = (d.getDay() + 6) % 7
              const isToday = date === today
              return (
                <div key={date} className="flex flex-col items-center gap-1">
                  <span className={`text-xs ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                    {DAYS_SHORT[dayIdx]}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    total === 0 ? 'bg-gray-50 text-gray-300' :
                    done === total ? 'bg-blue-400 text-white' :
                    done > 0 ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {total === 0 ? '—' : `${done}/${total}`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <HealthSection
        title="Таблетки"
        emoji="💊"
        events={medications}
        onAdd={() => openAdd('medication')}
        onEdit={setModal}
        onDelete={setConfirm}
        onToggle={toggleStatus}
      />

      <HealthSection
        title="Записи к врачу"
        emoji="🩺"
        events={doctors}
        onAdd={() => openAdd('doctor')}
        onEdit={setModal}
        onDelete={setConfirm}
        onToggle={toggleStatus}
      />

      <HealthSection
        title="Косметология"
        emoji="💆"
        events={cosmetics}
        onAdd={() => openAdd('cosmetic')}
        onEdit={setModal}
        onDelete={setConfirm}
        onToggle={toggleStatus}
      />

      {modal && (
        <EventModal
          event={modal === 'add' ? (defaultType ? { category: 'health', type: defaultType } : null) : modal}
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
