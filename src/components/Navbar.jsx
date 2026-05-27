import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { todayStr } from '../utils'

const LINKS = [
  { to: '/', label: 'Сегодня', emoji: '📅', cat: null },
  { to: '/sport', label: 'Спорт', emoji: '🏃', cat: 'sport', countClass: 'text-emerald-600' },
  { to: '/health', label: 'Здоровье', emoji: '💊', cat: 'health', countClass: 'text-blue-500' },
  { to: '/work', label: 'Работа', emoji: '💼', cat: 'work', countClass: 'text-amber-600' },
  { to: '/week', label: 'Неделя', emoji: '📆', cat: null },
]

export default function Navbar() {
  const events = useStore((s) => s.events)
  const today = todayStr()

  const count = (cat) =>
    events.filter((e) => e.category === cat && (e.date === today || e.deadline === today)).length

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-base text-gray-900 select-none">🗓 Day Planner</span>
        <div className="flex gap-0.5">
          {LINKS.map(({ to, label, emoji, cat, countClass }) => {
            const n = cat ? count(cat) : 0
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
              >
                <span>{emoji}</span>
                <span className="hidden sm:inline">{label}</span>
                {n > 0 && <span className={`text-xs font-bold ${countClass}`}>{n}</span>}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
