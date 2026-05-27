import { useState } from 'react'
import { useStore } from '../store/useStore'
import EventModal from '../components/EventModal'
import ConfirmModal from '../components/ConfirmModal'
import ProgressBar from '../components/ProgressBar'
import StatusBadge from '../components/StatusBadge'
import { todayStr } from '../utils'

const WEEK_DAYS = 7

function getWeekDates() {
  const dates = []
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  for (let i = 0; i < WEEK_DAYS; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

const ACTIVITY_EMOJI = {
  'бег': '🏃', 'тренажёрный зал': '🏋️', 'йога': '🧘', 'плавание': '🏊',
  'велосипед': '🚴', 'другое': '⚡'
}

export default function Sport() {
  const { events, addEvent, updateEvent, deleteEvent, toggleStatus } = useStore()
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [filter, setFilter] = useState('week')

  const today = todayStr()
  const weekDates = getWeekDates()

  const sportEvents = events
    .filter((e) => e.category === 'sport')
    .filter((e) => {
      if (filter === 'today') return e.date === today
      if (filter === 'week') return weekDates.includes(e.date)
      return true
    })
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)

  const weekEvents = events.filter((e) => e.category === 'sport' && weekDates.includes(e.date))
  const weekDone = weekEvents.filter((e) => e.status === 'done').length

  const handleSave = (form) => {
    if (modal === 'add') addEvent(form)
    else updateEvent(modal.id, form)
    setModal(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🏃 Спорт</h1>
        <button
          onClick={() => setModal('add')}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium"
        >
          + Тренировка
        </button>
      </div>

      {/* Weekly progress */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Прогресс недели</h2>
        <ProgressBar done={weekDone} total={weekEvents.length} colorClass="bg-emerald-400" />
        <div className="grid grid-cols-7 gap-1 mt-4">
          {weekDates.map((date) => {
            const dayEvents = events.filter((e) => e.category === 'sport' && e.date === date)
            const hasDone = dayEvents.some((e) => e.status === 'done')
            const isToday = date === today
            const d = new Date(date)
            const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
            const dayIdx = (d.getDay() + 6) % 7
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <span className={`text-xs ${isToday ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                  {dayNames[dayIdx]}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                  hasDone ? 'bg-emerald-400 border-emerald-400 text-white' :
                  dayEvents.length > 0 ? 'border-emerald-300 text-emerald-600' :
                  isToday ? 'border-gray-300 text-gray-900 font-bold' :
                  'border-gray-100 text-gray-400'
                }`}>
                  {d.getDate()}
                </div>
                {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[['today','Сегодня'],['week','Неделя'],['all','Все']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === v ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >{l}</button>
        ))}
      </div>

      {/* Events list */}
      <div className="space-y-2">
        {sportEvents.length === 0 ? (
          <div className="card text-center py-10">
            <div className="text-3xl mb-2">🏃</div>
            <p className="text-gray-400">Тренировок нет</p>
            <button onClick={() => setModal('add')} className="mt-3 text-sm text-emerald-500 hover:underline">Добавить</button>
          </div>
        ) : sportEvents.map((e) => (
          <div key={e.id} className={`card flex items-center gap-4 group border-l-4 border-l-emerald-400 ${e.status === 'done' ? 'opacity-70' : ''}`}>
            <div className="text-2xl">{ACTIVITY_EMOJI[e.activityType] || '⚡'}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 truncate">{e.title || e.activityType}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {e.date} · {e.time}{e.duration ? ` · ${e.duration} мин` : ''}
              </div>
              {e.notes && <div className="text-xs text-gray-400 mt-0.5 truncate">{e.notes}</div>}
            </div>
            <StatusBadge status={e.status} date={e.date} time={e.time} />
            <div className="flex gap-1 items-center">
              <button
                onClick={() => toggleStatus(e.id)}
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${e.status === 'done' ? 'bg-emerald-400 border-emerald-400 text-white' : 'border-gray-300 hover:border-emerald-300'}`}
              >
                {e.status === 'done' && <span className="text-xs leading-none">✓</span>}
              </button>
              <button onClick={() => setModal(e)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 text-sm transition-all">✎</button>
              <button onClick={() => setConfirm(e.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 text-sm transition-all">✕</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <EventModal
          event={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {confirm && (
        <ConfirmModal
          message="Удалить тренировку?"
          onConfirm={() => { deleteEvent(confirm); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
