export default function StatusBadge({ status, date, time }) {
  if (status === 'done') return <span className="badge-done">✓ выполнено</span>
  if (status === 'skipped') return <span className="badge-skipped">отложено</span>

  if (date) {
    const dt = new Date(`${date}T${time || '23:59'}`)
    const now = new Date()
    if (dt < now) return <span className="badge-overdue">⚠ просрочено</span>
    if (dt - now < 24 * 60 * 60 * 1000) return <span className="badge-soon">⏰ скоро</span>
  }

  return <span className="badge-pending">ожидает</span>
}
