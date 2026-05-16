import { useState } from 'react'
import { X, Check } from 'lucide-react'

const ICONS = [
  { id: 'droplet', label: '💧', name: 'Water' },
  { id: 'barbell', label: '🏋️', name: 'Gym' },
  { id: 'moon', label: '🌙', name: 'Sleep' },
  { id: 'book', label: '📚', name: 'Read' },
  { id: 'walk', label: '🚶', name: 'Walk' },
  { id: 'heart', label: '❤️', name: 'Health' },
  { id: 'apple', label: '🍎', name: 'Eat' },
  { id: 'pen', label: '✏️', name: 'Write' },
  { id: 'brain', label: '🧠', name: 'Learn' },
  { id: 'sun', label: '☀️', name: 'Morning' },
  { id: 'leaf', label: '🌿', name: 'Nature' },
  { id: 'music', label: '🎵', name: 'Music' },
]

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: 'M', tue: 'T', wed: 'W', thu: 'T', fri: 'F', sat: 'S', sun: 'S' }

export function AddHabitSheet({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('sun')
  const [frequency, setFrequency] = useState('daily')
  const [weeklyTarget, setWeeklyTarget] = useState(3)
  const [specificDays, setSpecificDays] = useState(['mon', 'wed', 'fri'])
  const [saving, setSaving] = useState(false)

  const toggleDay = (day) => {
    setSpecificDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      name: name.trim(), icon, frequency,
      weekly_target: frequency === 'weekly' ? weeklyTarget : null,
      specific_days: frequency === 'specific_days' ? specificDays : null,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-white dark:bg-neutral-900 rounded-t-3xl border-t border-x border-neutral-200 dark:border-neutral-800 p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">New habit</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-xs text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Drink 2L of water"
            className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-green-500/50 transition-colors"
            autoFocus
          />
        </div>

        {/* Icon */}
        <div className="mb-5">
          <label className="block text-xs text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map(i => (
              <button
                key={i.id}
                onClick={() => setIcon(i.id)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                  icon === i.id
                    ? 'bg-green-500/15 border border-green-500/40 scale-105'
                    : 'bg-neutral-100 dark:bg-neutral-800 border border-transparent'
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-6">
          <label className="block text-xs text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Frequency</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'specific_days', label: 'Specific days' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFrequency(f.id)}
                className={`py-2.5 rounded-xl text-sm transition-all ${
                  frequency === f.id
                    ? 'bg-green-500/15 border border-green-500/40 text-green-600 dark:text-green-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {frequency === 'weekly' && (
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-3">
              <span className="text-sm text-neutral-500 dark:text-neutral-400 flex-1">Times per week</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setWeeklyTarget(t => Math.max(1, t - 1))} className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-lg leading-none">−</button>
                <span className="text-sm font-mono font-medium w-4 text-center text-neutral-900 dark:text-neutral-100">{weeklyTarget}</span>
                <button onClick={() => setWeeklyTarget(t => Math.min(7, t + 1))} className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-lg leading-none">+</button>
              </div>
            </div>
          )}

          {frequency === 'specific_days' && (
            <div className="flex gap-2">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`flex-1 aspect-square rounded-xl text-xs font-medium transition-all ${
                    specificDays.includes(d)
                      ? 'bg-green-500/15 border border-green-500/40 text-green-600 dark:text-green-400'
                      : 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-500'
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full py-3.5 rounded-xl bg-green-500 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-400 active:scale-98 transition-all"
        >
          {saving ? 'Saving…' : <><Check size={16} strokeWidth={3} /> Create habit</>}
        </button>
      </div>
    </div>
  )
}
