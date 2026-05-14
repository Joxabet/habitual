import { useRef, useState } from 'react'
import { Flame, Check, Archive, Trash2, GripVertical } from 'lucide-react'
import { calcStreak, completionsThisWeek } from '../lib/streaks'

const ICONS = {
  droplet:'💧', barbell:'🏋️', moon:'🌙', book:'📚',
  walk:'🚶', heart:'❤️', apple:'🍎', pen:'✏️',
  brain:'🧠', sun:'☀️', leaf:'🌿', music:'🎵',
}

export function HabitCard({ habit, checkins, isDone, onToggle, onArchive, onDelete, dragHandleProps }) {
  const streak = calcStreak(checkins, habit)
  const weekCount = completionsThisWeek(checkins)
  const target = habit.frequency === 'weekly' ? habit.weekly_target || 3 : null

  // Long-press to reveal actions on mobile
  const [showActions, setShowActions] = useState(false)
  const pressTimer = useRef(null)

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setShowActions(true), 500)
  }
  const handlePressEnd = () => {
    clearTimeout(pressTimer.current)
  }

  if (showActions) {
    return (
      <div className="flex items-center gap-2 px-1 py-1 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex-1 px-3 py-2">
          <p className="text-sm text-neutral-400">{ICONS[habit.icon] || '✨'} {habit.name}</p>
        </div>
        <button
          onClick={() => { onArchive(); setShowActions(false) }}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 active:bg-amber-500/20"
        >
          <Archive size={16} className="text-amber-400" />
          <span className="text-[10px] text-amber-400">Archive</span>
        </button>
        <button
          onClick={() => { onDelete(); setShowActions(false) }}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 active:bg-red-500/20"
        >
          <Trash2 size={16} className="text-red-400" />
          <span className="text-[10px] text-red-400">Delete</span>
        </button>
        <button
          onClick={() => setShowActions(false)}
          className="px-3 py-2 text-xs text-neutral-600 active:text-neutral-400"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
        isDone ? 'bg-neutral-900 border-green-500/30' : 'bg-neutral-900 border-neutral-800'
      }`}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="flex-shrink-0 text-neutral-700 active:text-neutral-400 touch-none cursor-grab active:cursor-grabbing p-1 -ml-1"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
        isDone ? 'bg-green-500/10' : 'bg-neutral-800'
      }`}>
        {ICONS[habit.icon] || '✨'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm leading-tight ${isDone ? 'text-neutral-500 line-through decoration-neutral-700' : 'text-neutral-100'}`}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400 font-mono">
              <Flame size={10} />{streak}
            </span>
          )}
          {target && (
            <div className="flex items-center gap-1">
              {Array.from({ length: target }).map((_, i) => (
                <div key={i} className={`w-3.5 h-1.5 rounded-full ${i < weekCount ? 'bg-green-500' : 'bg-neutral-700'}`} />
              ))}
              <span className="text-xs text-neutral-500 ml-1 font-mono">{weekCount}/{target}</span>
            </div>
          )}
          {!streak && !target && (
            <span className="text-xs text-neutral-600">{habit.frequency === 'daily' ? 'daily' : habit.frequency}</span>
          )}
        </div>
      </div>

      {/* Check */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
          isDone
            ? 'bg-green-500 border-green-500 text-neutral-950'
            : 'border-neutral-700 text-transparent'
        }`}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        <Check size={14} strokeWidth={3} />
      </button>
    </div>
  )
}
