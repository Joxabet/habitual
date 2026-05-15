import { useState } from 'react'
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, addDays, parseISO, isToday, isFuture } from 'date-fns'

const ICONS = {
  droplet:'💧', barbell:'🏋️', moon:'🌙', book:'📚',
  walk:'🚶', heart:'❤️', apple:'🍎', pen:'✏️',
  brain:'🧠', sun:'☀️', leaf:'🌿', music:'🎵',
}

export function PastDaySheet({ date, habits, isDoneOn, onToggle, onClose }) {
  const [selectedDate, setSelectedDate] = useState(date)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())

  const dateObj = parseISO(selectedDate)
  const isCurrentDay = isToday(dateObj)
  const label = isCurrentDay
    ? 'Today'
    : format(dateObj, 'EEEE, MMM d')

  const goBack = () => {
    const prev = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd')
    setSelectedDate(prev)
  }

  const goForward = () => {
    const next = addDays(parseISO(selectedDate), 1)
    if (!isFuture(next) || isToday(next)) {
      setSelectedDate(format(next, 'yyyy-MM-dd'))
    }
  }

  const canGoForward = !isCurrentDay

  // Build calendar grid for current month
  const buildCalendar = () => {
    const year = calMonth.getFullYear()
    const month = calMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    // Start from Monday
    const startOffset = (firstDay.getDay() + 6) % 7
    const days = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      days.push(date)
    }
    return days
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-neutral-900 dark:bg-neutral-900 rounded-t-3xl border-t border-x border-neutral-800 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button onClick={onClose} className="p-2 text-neutral-500 active:text-neutral-300">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-2 text-neutral-400 active:text-neutral-200">
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setShowCalendar(s => !s)}
              className="text-sm font-medium text-neutral-200 min-w-[140px] text-center active:text-green-400 transition-colors"
            >
              {label}
            </button>
            <button
              onClick={goForward}
              disabled={!canGoForward}
              className={`p-2 transition-colors ${canGoForward ? 'text-neutral-400 active:text-neutral-200' : 'text-neutral-700'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="w-9" /> {/* spacer */}
        </div>

        {/* Calendar picker */}
        {showCalendar && (
          <div className="px-4 pb-4 border-b border-neutral-800 mb-2">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="p-1.5 text-neutral-500 active:text-neutral-300"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-neutral-300">
                {format(calMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => {
                  const next = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1)
                  if (next <= new Date()) setCalMonth(next)
                }}
                className="p-1.5 text-neutral-500 active:text-neutral-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-neutral-600">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {buildCalendar().map((d, i) => {
                if (!d) return <div key={i} />
                const dateStr = format(d, 'yyyy-MM-dd')
                const isSelected = dateStr === selectedDate
                const isFut = isFuture(d) && !isToday(d)
                return (
                  <button
                    key={i}
                    disabled={isFut}
                    onClick={() => { setSelectedDate(dateStr); setShowCalendar(false) }}
                    className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-green-500 text-neutral-950 font-medium'
                        : isFut
                        ? 'text-neutral-700 cursor-not-allowed'
                        : 'text-neutral-400 active:bg-neutral-700'
                    }`}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Habit list */}
        <div className="px-4 max-h-80 overflow-y-auto scrollbar-hide">
          {habits.length === 0 ? (
            <div className="text-center py-8 text-neutral-600 text-sm">No habits to show</div>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              {habits.map(h => {
                const done = isDoneOn(h.id, selectedDate)
                return (
                  <button
                    key={h.id}
                    onClick={() => onToggle(h.id, selectedDate)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-98 w-full ${
                      done
                        ? 'bg-neutral-900 border-green-500/30'
                        : 'bg-neutral-800/50 border-neutral-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                      done ? 'bg-green-500/10' : 'bg-neutral-800'
                    }`}>
                      {ICONS[h.icon] || '✨'}
                    </div>
                    <span className={`flex-1 text-left text-sm font-medium ${
                      done ? 'text-neutral-400 line-through decoration-neutral-600' : 'text-neutral-200'
                    }`}>
                      {h.name}
                    </span>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      done ? 'bg-green-500 border-green-500 text-neutral-950' : 'border-neutral-600 text-transparent'
                    }`}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 pt-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-green-500 text-neutral-950 font-medium text-sm active:bg-green-400 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
