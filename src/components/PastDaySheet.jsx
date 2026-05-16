import { useState } from 'react'
import { X, Check, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, subDays, addDays, parseISO, isToday, isFuture, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek } from 'date-fns'

const ICONS = {
  droplet:'💧', barbell:'🏋️', moon:'🌙', book:'📚',
  walk:'🚶', heart:'❤️', apple:'🍎', pen:'✏️',
  brain:'🧠', sun:'☀️', leaf:'🌿', music:'🎵',
}

export function PastDaySheet({ date, habits, isDoneOn, onToggle, onClose }) {
  const [selectedDate, setSelectedDate] = useState(date)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calMonth, setCalMonth] = useState(() => parseISO(date))

  const dateObj = parseISO(selectedDate)
  const isCurrentDay = isToday(dateObj)
  const label = isCurrentDay ? 'Today' : format(dateObj, 'EEE, MMM d')

  const goBack = () => {
    setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  }

  const goForward = () => {
    const next = addDays(parseISO(selectedDate), 1)
    if (!isFuture(next) || isToday(next)) {
      setSelectedDate(format(next, 'yyyy-MM-dd'))
    }
  }

  const buildCalendar = () => {
    const start = startOfWeek(startOfMonth(calMonth), { weekStartsOn: 1 })
    const end = endOfMonth(calMonth)
    return eachDayOfInterval({ start, end })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-lg mx-auto rounded-t-3xl pb-8"
        style={{ background: '#161616', border: '0.5px solid #2a2a2a' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        {/* Navigation row */}
        <div className="flex items-center px-2 py-2">
          {/* Back arrow — large touch target */}
          <button
            onPointerDown={e => { e.stopPropagation(); goBack() }}
            style={{ minWidth: 52, minHeight: 52 }}
            className="flex items-center justify-center rounded-2xl active:bg-neutral-800"
            aria-label="Previous day"
          >
            <ChevronLeft size={24} color="#aaa" />
          </button>

          {/* Date label — tap to open calendar */}
          <button
            onPointerDown={e => { e.stopPropagation(); setShowCalendar(s => !s) }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl active:bg-neutral-800"
          >
            <Calendar size={15} color="#4ade80" />
            <span style={{ fontSize: 15, fontWeight: 500, color: '#e5e5e5' }}>{label}</span>
          </button>

          {/* Forward arrow */}
          <button
            onPointerDown={e => { e.stopPropagation(); goForward() }}
            style={{ minWidth: 52, minHeight: 52, opacity: isCurrentDay ? 0.3 : 1 }}
            className="flex items-center justify-center rounded-2xl active:bg-neutral-800"
            aria-label="Next day"
            disabled={isCurrentDay}
          >
            <ChevronRight size={24} color="#aaa" />
          </button>
        </div>

        {/* Calendar picker */}
        {showCalendar && (
          <div className="mx-4 mb-3 rounded-2xl overflow-hidden" style={{ background: '#1e1e1e' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onPointerDown={e => { e.stopPropagation(); setCalMonth(m => subDays(startOfMonth(m), 1)) }}
                style={{ minWidth: 44, minHeight: 44 }}
                className="flex items-center justify-center rounded-xl active:bg-neutral-700"
              >
                <ChevronLeft size={18} color="#888" />
              </button>
              <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>
                {format(calMonth, 'MMMM yyyy')}
              </span>
              <button
                onPointerDown={e => {
                  e.stopPropagation()
                  const next = addDays(endOfMonth(calMonth), 1)
                  if (next <= new Date()) setCalMonth(next)
                }}
                style={{ minWidth: 44, minHeight: 44 }}
                className="flex items-center justify-center rounded-xl active:bg-neutral-700"
              >
                <ChevronRight size={18} color="#888" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-2 pb-1">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: '#555', textAlign: 'center', paddingBottom: 4 }}>{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 px-2 pb-3">
              {buildCalendar().map((d, i) => {
                const dateStr = format(d, 'yyyy-MM-dd')
                const isSelected = dateStr === selectedDate
                const isFut = isFuture(d) && !isToday(d)
                const isThisMonth = d.getMonth() === calMonth.getMonth()
                return (
                  <button
                    key={i}
                    disabled={isFut}
                    onPointerDown={e => {
                      e.stopPropagation()
                      if (!isFut) { setSelectedDate(dateStr); setShowCalendar(false) }
                    }}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 8,
                      fontSize: 13,
                      background: isSelected ? '#4ade80' : 'transparent',
                      color: isSelected ? '#0a0a0a' : isFut ? '#333' : isThisMonth ? '#ccc' : '#444',
                      fontWeight: isSelected ? 600 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minHeight: 36,
                    }}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Habits list */}
        <div className="px-4 overflow-y-auto" style={{ maxHeight: 320 }}>
          {habits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#555', fontSize: 13 }}>
              No habits yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
              {habits.map(h => {
                const done = isDoneOn(h.id, selectedDate)
                return (
                  <button
                    key={h.id}
                    onPointerDown={e => { e.stopPropagation(); onToggle(h.id, selectedDate) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px',
                      borderRadius: 16,
                      border: done ? '0.5px solid rgba(74,222,128,0.3)' : '0.5px solid #2a2a2a',
                      background: done ? 'rgba(74,222,128,0.05)' : '#1e1e1e',
                      width: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: done ? 'rgba(74,222,128,0.1)' : '#2a2a2a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {ICONS[h.icon] || '✨'}
                    </div>
                    <span style={{
                      flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 500,
                      color: done ? '#555' : '#e5e5e5',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                      {h.name}
                    </span>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      border: done ? '2px solid #4ade80' : '2px solid #3a3a3a',
                      background: done ? '#4ade80' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done && <Check size={13} color="#0a0a0a" strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Done button */}
        <div className="px-4 pt-4">
          <button
            onPointerDown={e => { e.stopPropagation(); onClose() }}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: '#4ade80', color: '#0a0a0a',
              fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
