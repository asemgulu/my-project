import { useState } from 'react'
import { CAT_CLASSES, todayStr } from '../utils'

const ACTIVITY_TYPES = ['бег', 'тренажёрный зал', 'йога', 'плавание', 'велосипед', 'другое']

const CAT_META = {
  sport:  { label: 'Спорт',    emoji: '🏃' },
  health: { label: 'Здоровье', emoji: '💊' },
  work:   { label: 'Работа',   emoji: '💼' },
}

const HEALTH_TYPES = [
  { value: 'medication', label: '💊 Таблетки' },
  { value: 'doctor',     label: '🩺 Врач' },
  { value: 'cosmetic',   label: '💆 Косметолог' },
]

const WORK_TYPES = [
  { value: 'meeting', label: '🤝 Встреча' },
  { value: 'task',    label: '✅ Задача' },
]

function emptyForm() {
  return {
    category: '', type: '', title: '', date: todayStr(), time: '09:00',
    duration: 60, notes: '', status: 'pending',
    activityType: 'бег',
    medicationName: '', dosage: '', recurrence: 'daily',
    specialty: '', location: '', procedure: '', master: '', salon: '',
    participants: '', link: '',
    priority: 'medium', deadline: todayStr(),
  }
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export default function EventModal({ event, onSave, onClose }) {
  const isEdit = !!event
  const [form, setForm] = useState(isEdit ? { ...emptyForm(), ...event } : emptyForm())

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSave = () => {
    if (!form.category) return alert('Выберите категорию')
    if (form.category !== 'sport' && !form.type) return alert('Выберите тип')
    if (form.type === 'medication' && !form.medicationName.trim()) return alert('Введите название препарата')
    if (form.type !== 'medication' && form.category !== 'sport' && !form.title.trim()) return alert('Введите название')
    if (form.category === 'sport') {
      const finalTitle = form.title.trim() || form.activityType
      onSave({ ...form, type: 'workout', title: finalTitle })
    } else {
      onSave(form)
    }
  }

  const cc = form.category ? CAT_CLASSES[form.category] : null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isEdit ? 'Редактировать событие' : 'Новое событие'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Category selector */}
          {!isEdit && (
            <Field label="Категория">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CAT_META).map(([cat, meta]) => {
                  const c = CAT_CLASSES[cat]
                  const active = form.category === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { set('category', cat); set('type', cat === 'sport' ? 'workout' : '') }}
                      className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${active ? c.btnActive : c.btnInactive}`}
                    >
                      {meta.emoji} {meta.label}
                    </button>
                  )
                })}
              </div>
            </Field>
          )}

          {/* Health type */}
          {form.category === 'health' && !isEdit && (
            <Field label="Тип">
              <div className="grid grid-cols-3 gap-2">
                {HEALTH_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('type', t.value)}
                    className={`py-2 px-2 rounded-xl border-2 text-sm font-medium transition-all ${form.type === t.value ? CAT_CLASSES.health.btnActive : CAT_CLASSES.health.btnInactive}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Work type */}
          {form.category === 'work' && !isEdit && (
            <Field label="Тип">
              <div className="grid grid-cols-2 gap-2">
                {WORK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('type', t.value)}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${form.type === t.value ? CAT_CLASSES.work.btnActive : CAT_CLASSES.work.btnInactive}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* ---- SPORT ---- */}
          {form.category === 'sport' && (
            <>
              <Field label="Тип активности">
                <select className="input-field" value={form.activityType} onChange={(e) => set('activityType', e.target.value)}>
                  {ACTIVITY_TYPES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Название (необязательно)">
                <input className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Напр., Утренняя пробежка" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Дата"><input type="date" className="input-field" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
                <Field label="Время"><input type="time" className="input-field" value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
              </div>
              <Field label="Длительность (мин)">
                <input type="number" className="input-field" value={form.duration} min={5} step={5} onChange={(e) => set('duration', +e.target.value)} />
              </Field>
            </>
          )}

          {/* ---- MEDICATION ---- */}
          {form.type === 'medication' && (
            <>
              <Field label="Препарат"><input className="input-field" value={form.medicationName} onChange={(e) => set('medicationName', e.target.value)} placeholder="Название таблетки" /></Field>
              <Field label="Дозировка"><input className="input-field" value={form.dosage} onChange={(e) => set('dosage', e.target.value)} placeholder="Напр., 1 таблетка 500 мг" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Дата"><input type="date" className="input-field" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
                <Field label="Время"><input type="time" className="input-field" value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
              </div>
              <Field label="Повторяемость">
                <select className="input-field" value={form.recurrence} onChange={(e) => set('recurrence', e.target.value)}>
                  <option value="once">Однократно</option>
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                </select>
              </Field>
            </>
          )}

          {/* ---- DOCTOR ---- */}
          {form.type === 'doctor' && (
            <>
              <Field label="Специальность"><input className="input-field" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} placeholder="Напр., Кардиолог" /></Field>
              <Field label="Название визита"><input className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Напр., Плановый осмотр" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Дата"><input type="date" className="input-field" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
                <Field label="Время"><input type="time" className="input-field" value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
              </div>
              <Field label="Адрес / Клиника"><input className="input-field" value={form.location} onChange={(e) => set('location', e.target.value)} /></Field>
            </>
          )}

          {/* ---- COSMETIC ---- */}
          {form.type === 'cosmetic' && (
            <>
              <Field label="Процедура"><input className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Напр., Маникюр" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Дата"><input type="date" className="input-field" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
                <Field label="Время"><input type="time" className="input-field" value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
              </div>
              <Field label="Мастер"><input className="input-field" value={form.master} onChange={(e) => set('master', e.target.value)} /></Field>
              <Field label="Салон"><input className="input-field" value={form.salon} onChange={(e) => set('salon', e.target.value)} /></Field>
            </>
          )}

          {/* ---- MEETING ---- */}
          {form.type === 'meeting' && (
            <>
              <Field label="Название"><input className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Напр., Планёрка" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Дата"><input type="date" className="input-field" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
                <Field label="Время"><input type="time" className="input-field" value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
              </div>
              <Field label="Длительность (мин)">
                <input type="number" className="input-field" value={form.duration} min={15} step={15} onChange={(e) => set('duration', +e.target.value)} />
              </Field>
              <Field label="Участники (через запятую)"><input className="input-field" value={form.participants} onChange={(e) => set('participants', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Место"><input className="input-field" value={form.location} onChange={(e) => set('location', e.target.value)} /></Field>
                <Field label="Ссылка"><input className="input-field" value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://..." /></Field>
              </div>
            </>
          )}

          {/* ---- TASK ---- */}
          {form.type === 'task' && (
            <>
              <Field label="Название задачи"><input className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
              <Field label="Дедлайн"><input type="date" className="input-field" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} /></Field>
              <Field label="Приоритет">
                <select className="input-field" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                  <option value="high">🔴 Высокий</option>
                  <option value="medium">🟡 Средний</option>
                  <option value="low">🟢 Низкий</option>
                </select>
              </Field>
              {isEdit && (
                <Field label="Статус">
                  <select className="input-field" value={form.status} onChange={(e) => set('status', e.target.value)}>
                    <option value="pending">В работе</option>
                    <option value="done">Выполнена</option>
                    <option value="skipped">Отложена</option>
                  </select>
                </Field>
              )}
            </>
          )}

          {/* Notes */}
          {form.category && (form.category === 'sport' || form.type) && (
            <Field label="Заметки">
              <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Необязательно..." />
            </Field>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!form.category || (form.category !== 'sport' && !form.type)}
            className={`flex-1 py-2 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-40 ${cc ? cc.solid : 'bg-gray-400'} hover:opacity-90`}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  )
}
