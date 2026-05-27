import { useState } from 'react'
import { useStore } from '../store/useStore'
import { eventTitle, eventEmoji, CAT_CLASSES } from '../utils'

const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
const MONTHS_RU = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']

function getWeekDates(offset = 0) {
  const dates = []
  const now = new Date()
  now.setDate(now.getDate() + offset * 7)
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

export default function Week() {
  const { events } = useStore()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selected, setSelected] = useState(null)

  const weekDates = getWeekDates(weekOffset)
  const today = new Date().toISOString().slice(0, 10)

  const weekLabel = () => {
    const first = weekDates[0]
    const last = weekDates[6]
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}–${last.getDate()} ${MONTHS_RU[first.getMonth()]} ${first.getFullYear()}`
    }
    return `${first.getDate()} ${MONTHS_RU[first.getMonth()]} – ${last.getDate()} ${MONTHS_RU[last.getMonth()]} ${first.getFullYear()}`
  }

  const getEventsForDate = (date) => {
    const ds = date.toISOString().slice(0, 10)
    return events.filter((e) => e.date === ds || e.deadline === ds)
      .sort((a, b) => (a.time || '00:00') > (b.time || '00:00') ? 1 : -1)
  }

  const selectedDateStr = selected?.toISOString().slice(0, 10)
  const selectedEvents = selected ? getEventsForDate(selected) : []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📆 Неделя</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600"
          >‹</button>
          <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center">{weekLabel()}</span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600"
          >›</button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-blue-500 hover:underline">Сегодня</button>
          )}
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDates.map((date, i) => {
          const ds = date.toISOString().slice(0, 10)
          const dayEvents = getEventsForDate(date)
          const isToday = ds === today
          const isSelected = selected && ds === selectedDateStr
          const byCat = { sport: 0, health: 0, work: 0 }
          dayEvents.forEach((e) => { if (byCat[e.category] !== undefined) byCat[e.category]++ })

          return (
            <button
              key={ds}
              onClick={() => setSelected(isSelected ? null : date)}
              className={`rounded-2xl p-2 text-left transition-all border-2 ${
                isSelected ? 'border-gray-800 bg-gray-50' :
                isToday ? 'border-gray-300 bg-white' :
                'border-transparent bg-white hover:border-gray-200'
              } shadow-sm`}
            >
              <div className="text-xs text-gray-400 mb-1">{DAYS_RU[i]}</div>
              <div className={`text-lg font-bold mb-2 ${isToday ? 'text-gray-900' : 'text-gray-700'}`}>
                {date.getDate()}
              </div>
              {dayEvents.length > 0 ? (
                <div className="space-y-0.5">
                  {byCat.sport > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-gray-500">{byCat.sport}</span>
                    </div>
                  )}
                  {byCat.health > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-[10px] text-gray-500">{byCat.health}</span>
                    </div>
                  )}
                  {byCat.work > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-[10px] text-gray-500">{byCat.work}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-4" />
              )}
            </button>
          )
        })}
      </div>

      {/* Day detail panel */}
      {selected && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">
            {DAYS_RU[(selected.getDay() + 6) % 7]}, {selected.getDate()} {MONTHS_RU[selected.getMonth()]}
          </h2>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Нет событий</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => {
                const c = CAT_CLASSES[e.category]
                return (
                  <div key={e.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
                    <span className="text-base">{eventEmoji(e)}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${c.text} truncate`}>{eventTitle(e)}</div>
                      <div className="text-xs text-gray-400">
                        {e.time || e.deadline}{e.duration ? ` · ${e.duration} мин` : ''}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>
                      {e.status === 'done' ? '✓' : e.category}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 px-1">
        <span className="text-xs text-gray-400">Легенда:</span>
        {[['bg-emerald-400','Спорт'],['bg-blue-400','Здоровье'],['bg-amber-400','Работа']].map(([cls, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
