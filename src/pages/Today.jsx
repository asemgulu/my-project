import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import EventModal from '../components/EventModal'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import { eventTitle, eventEmoji, CAT_CLASSES, todayStr } from '../utils'

const HOUR_PX = 80
const START_HOUR = 6
const END_HOUR = 24
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

function timeToOffset(time) {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  return (h * 60 + m - START_HOUR * 60)
}

const CAT_INFO = {
  sport:  { label: 'Спорт',    emoji: '🏃', to: '/sport' },
  health: { label: 'Здоровье', emoji: '💊', to: '/health' },
  work:   { label: 'Работа',   emoji: '💼', to: '/work' },
}

const DAYS_RU = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']
const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

export default function Today() {
  const { events, addEvent, updateEvent, deleteEvent, toggleStatus } = useStore()
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const timelineRef = useRef(null)

  const today = todayStr()
  const now = new Date()
  const todayEvents = events.filter((e) => e.date === today || e.deadline === today)

  const currentOffset = (now.getHours() * 60 + now.getMinutes() - START_HOUR * 60)
  const currentTop = (currentOffset / 60) * HOUR_PX
  const showLine = currentOffset >= 0 && currentOffset <= (END_HOUR - START_HOUR) * 60

  useEffect(() => {
    if (timelineRef.current && showLine) {
      timelineRef.current.scrollTop = Math.max(0, currentTop - 120)
    }
  }, [])

  const handleSave = (form) => {
    if (modal === 'add') addEvent(form)
    else updateEvent(modal.id, form)
    setModal(null)
  }

  const timelineEvents = todayEvents.filter((e) => e.time && e.type !== 'task')
  const taskEvents = todayEvents.filter((e) => e.type === 'task')

  const d = now
  const dateLabel = `${DAYS_RU[d.getDay()]}, ${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{dateLabel}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {now.getHours()}:{String(now.getMinutes()).padStart(2, '0')} · {todayEvents.length} событий сегодня
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          + Добавить
        </button>
      </div>

      {/* Category summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(CAT_INFO).map(([cat, info]) => {
          const evts = todayEvents.filter((e) => e.category === cat)
          const done = evts.filter((e) => e.status === 'done').length
          const c = CAT_CLASSES[cat]
          return (
            <Link
              key={cat}
              to={info.to}
              className={`card flex flex-col gap-1 border-l-4 ${c.borderLeft} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <span>{info.emoji}</span>
                <span>{info.label}</span>
              </div>
              <div className={`text-3xl font-bold ${c.text}`}>{evts.length}</div>
              <div className="text-xs text-gray-400">{done}/{evts.length} выполнено</div>
            </Link>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Таймлайн</h2>
          <span className="text-sm text-gray-400">
            {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
          </span>
        </div>
        <div ref={timelineRef} className="overflow-y-auto" style={{ maxHeight: 460 }}>
          <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}>
            {/* Hour grid */}
            {HOURS.map((h, i) => (
              <div key={h} className="absolute w-full flex" style={{ top: i * HOUR_PX }}>
                <span className="w-14 shrink-0 text-right pr-3 text-xs text-gray-300 select-none pt-0.5">
                  {String(h).padStart(2,'0')}:00
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>
            ))}

            {/* Current time */}
            {showLine && (
              <div className="absolute w-full flex items-center pointer-events-none z-10" style={{ top: currentTop }}>
                <span className="w-14 shrink-0 text-right pr-2 text-[10px] text-red-400 font-semibold select-none">
                  {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0 -ml-1.5" />
                <div className="flex-1 border-t-2 border-red-300" />
              </div>
            )}

            {/* Events */}
            <div className="absolute inset-0 pl-14 pr-2">
              {timelineEvents.map((e) => {
                const offset = timeToOffset(e.time)
                if (offset === null) return null
                const top = (offset / 60) * HOUR_PX
                const height = Math.max(32, ((e.duration || 30) / 60) * HOUR_PX - 4)
                const c = CAT_CLASSES[e.category]
                return (
                  <div
                    key={e.id}
                    style={{ top, height, left: 0, right: 0, position: 'absolute', marginLeft: 4, marginRight: 4 }}
                    className={`rounded-lg border ${c.bg} ${c.border} px-2 py-1 cursor-pointer hover:shadow-sm transition-shadow overflow-hidden ${e.status === 'done' ? 'opacity-60' : ''}`}
                    onClick={() => setModal(e)}
                  >
                    <div className="flex items-center justify-between gap-1 min-w-0">
                      <span className={`text-xs font-medium ${c.text} truncate`}>
                        {eventEmoji(e)} {eventTitle(e)}
                      </span>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); toggleStatus(e.id) }}
                        className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${e.status === 'done' ? 'bg-green-400 border-green-400' : 'border-gray-300 bg-white'}`}
                      >
                        {e.status === 'done' && <span className="text-white text-[8px] leading-none">✓</span>}
                      </button>
                    </div>
                    {height >= 40 && (
                      <span className="text-[10px] text-gray-400">{e.time}{e.duration ? ` · ${e.duration} мин` : ''}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {taskEvents.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3">✅ Задачи на сегодня</h3>
          <div className="space-y-2">
            {taskEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => toggleStatus(e.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${e.status === 'done' ? 'bg-amber-400 border-amber-400' : 'border-gray-300 hover:border-amber-300'}`}
                >
                  {e.status === 'done' && <span className="text-white text-[10px] leading-none">✓</span>}
                </button>
                <span className={`flex-1 text-sm ${e.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {e.title}
                </span>
                <StatusBadge status={e.status} date={e.deadline} time="23:59" />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal(e)} className="text-xs text-gray-400 hover:text-gray-600 px-1">✎</button>
                  <button onClick={() => setConfirm(e.id)} className="text-xs text-gray-400 hover:text-red-500 px-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayEvents.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">На сегодня ничего нет</p>
          <button onClick={() => setModal('add')} className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline">
            Добавить событие
          </button>
        </div>
      )}

      {modal && (
        <EventModal event={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {confirm && (
        <ConfirmModal
          message="Удалить это событие?"
          onConfirm={() => { deleteEvent(confirm); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
