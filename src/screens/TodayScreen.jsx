import { useState, useMemo } from 'react'
import { Plus, CalendarDays, X, Check, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, subDays, addDays, parseISO, isToday, isFuture, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek } from 'date-fns'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragOverlay
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HabitCard } from '../components/HabitCard'
import { AddHabitSheet } from '../components/AddHabitSheet'
import { MissedDayBanner } from '../components/MissedDayBanner'
import { getWeekDays, today, yesterday, missedYesterday } from '../lib/streaks'

// ─── PastDaySheet (inlined) ───────────────────────────────────────────────────

const PAST_ICONS = {
  droplet:'💧', barbell:'🏋️', moon:'🌙', book:'📚',
  walk:'🚶', heart:'❤️', apple:'🍎', pen:'✏️',
  brain:'🧠', sun:'☀️', leaf:'🌿', music:'🎵',
}

function PastDaySheet({ date, habits, isDoneOn, onToggle, onClose }) {
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
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative w-full max-w-lg mx-auto rounded-t-3xl pb-8"
        style={{ background: '#161616', border: '0.5px solid #2a2a2a' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        {/* Navigation */}
        <div className="flex items-center px-2 py-2">
          <button
            onPointerDown={e => { e.stopPropagation(); goBack() }}
            style={{ minWidth: 52, minHeight: 52 }}
            className="flex items-center justify-center rounded-2xl active:bg-neutral-800"
            aria-label="Previous day"
          >
            <ChevronLeft size={24} color="#aaa" />
          </button>

          <button
            onPointerDown={e => { e.stopPropagation(); setShowCalendar(s => !s) }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl active:bg-neutral-800"
          >
            <Calendar size={15} color="#4ade80" />
            <span style={{ fontSize: 15, fontWeight: 500, color: '#e5e5e5' }}>{label}</span>
          </button>

          <button
            onPointerDown={e => { e.stopPropagation(); goForward() }}
            style={{ minWidth: 52, minHeight: 52, opacity: isCurrentDay ? 0.3 : 1 }}
            className="flex items-center justify-center rounded-2xl active:bg-neutral-800"
            disabled={isCurrentDay}
            aria-label="Next day"
          >
            <ChevronRight size={24} color="#aaa" />
          </button>
        </div>

        {/* Calendar */}
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
            <div className="grid grid-cols-7 px-2 pb-1">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: '#555', textAlign: 'center', paddingBottom: 4 }}>{d}</div>
              ))}
            </div>
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
                      aspectRatio: '1', borderRadius: 8, fontSize: 13,
                      background: isSelected ? '#4ade80' : 'transparent',
                      color: isSelected ? '#0a0a0a' : isFut ? '#333' : isThisMonth ? '#ccc' : '#444',
                      fontWeight: isSelected ? 600 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minHeight: 36, border: 'none', cursor: isFut ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Habits */}
        <div className="px-4 overflow-y-auto" style={{ maxHeight: 320 }}>
          {habits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#555', fontSize: 13 }}>No habits yet</div>
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
                      padding: '14px 16px', borderRadius: 16,
                      border: done ? '0.5px solid rgba(74,222,128,0.3)' : '0.5px solid #2a2a2a',
                      background: done ? 'rgba(74,222,128,0.05)' : '#1e1e1e',
                      width: '100%', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: done ? 'rgba(74,222,128,0.1)' : '#2a2a2a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {PAST_ICONS[h.icon] || '✨'}
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

        {/* Done */}
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

// ─── SortableHabitCard ────────────────────────────────────────────────────────

function SortableHabitCard({ habit, checkins, isDone, onToggle, onArchive, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }
  return (
    <div ref={setNodeRef} style={style}>
      <HabitCard
        habit={habit}
        checkins={checkins}
        isDone={isDone}
        onToggle={onToggle}
        onArchive={onArchive}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

// ─── TodayScreen ─────────────────────────────────────────────────────────────

export function TodayScreen({
  habits, checkins, isDoneToday, isDoneOn,
  onToggle, onAdd, onArchive, onDelete, onReorder
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [pastDayDate, setPastDayDate] = useState(null)
  const [dismissedMissed, setDismissedMissed] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const weekDays = getWeekDays()
  const todayStr = today()
  const doneCount = habits.filter(h => isDoneToday(h.id)).length
  const dayName = format(new Date(), 'EEEE')
  const completion = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0
  const yest = yesterday()

  const habitsWithMissed = useMemo(() => habits.map(h => ({
    ...h,
    _missedYesterday: missedYesterday(checkins[h.id] || [], h)
  })), [habits, checkins])
  const anyMissed = habitsWithMissed.some(h => h._missedYesterday)

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    if (active.id !== over?.id) {
      const oldIndex = habits.findIndex(h => h.id === active.id)
      const newIndex = habits.findIndex(h => h.id === over.id)
      onReorder(arrayMove(habits, oldIndex, newIndex))
    }
  }

  const handleDayTap = (day) => {
    if (day.date === todayStr) return
    const d = parseISO(day.date)
    if (!isFuture(d) || isToday(d)) setPastDayDate(day.date)
  }

  const daily = habits.filter(h => h.frequency === 'daily')
  const weekly = habits.filter(h => h.frequency === 'weekly' || h.frequency === 'specific_days')
  const activeHabit = activeId ? habits.find(h => h.id === activeId) : null

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-neutral-950">

      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">{dayName}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{doneCount} of {habits.length} done</p>
          </div>
          <button
            onPointerDown={() => setPastDayDate(yest)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 active:bg-neutral-100 dark:active:bg-neutral-900 transition-colors"
          >
            <CalendarDays size={13} />
            Past day
          </button>
        </div>

        {habits.length > 0 && (
          <div className="mt-4">
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            {completion === 100 && (
              <p className="text-xs text-green-500 dark:text-green-400 mt-1.5 text-center font-medium">All done today 🎉</p>
            )}
          </div>
        )}
      </div>

      {/* Week strip */}
      <div className="flex px-3 mb-4">
        {weekDays.map(day => {
          const anyDone = habits.some(h => (checkins[h.id] || []).some(c => c.date === day.date))
          const isPast = day.date < todayStr
          return (
            <button
              key={day.date}
              onPointerDown={() => handleDayTap(day)}
              style={{ minHeight: 56 }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl ${isPast ? 'active:bg-neutral-100 dark:active:bg-neutral-900' : ''} transition-colors`}
            >
              <span className="text-[10px] text-neutral-400 dark:text-neutral-600">{day.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                day.isToday
                  ? 'border-2 border-green-500 text-green-600 dark:text-green-400 font-semibold'
                  : anyDone
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : isPast
                  ? 'border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600'
                  : 'text-neutral-300 dark:text-neutral-800'
              }`}>
                {day.date.slice(-2)}
              </div>
            </button>
          )
        })}
      </div>

      {/* Missed banner */}
      {anyMissed && !dismissedMissed && (
        <MissedDayBanner
          habits={habitsWithMissed}
          onLogYesterday={() => setPastDayDate(yest)}
          onDismiss={() => setDismissedMissed(true)}
        />
      )}

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">No habits yet</p>
          <p className="text-neutral-400 dark:text-neutral-600 text-xs mt-1 leading-relaxed">Start with one small habit.</p>
        </div>
      )}

      {/* Habit lists */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        {daily.length > 0 && (
          <div className="px-4 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-2 px-1">Daily</p>
            <SortableContext items={daily.map(h => h.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {daily.map(h => (
                  <SortableHabitCard key={h.id} habit={h}
                    checkins={checkins[h.id] || []}
                    isDone={isDoneToday(h.id)}
                    onToggle={() => onToggle(h.id)}
                    onArchive={() => onArchive(h.id)}
                    onDelete={() => onDelete(h.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {weekly.length > 0 && (
          <div className="px-4 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-2 px-1">Weekly goals</p>
            <SortableContext items={weekly.map(h => h.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {weekly.map(h => (
                  <SortableHabitCard key={h.id} habit={h}
                    checkins={checkins[h.id] || []}
                    isDone={isDoneToday(h.id)}
                    onToggle={() => onToggle(h.id)}
                    onArchive={() => onArchive(h.id)}
                    onDelete={() => onDelete(h.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        <DragOverlay>
          {activeHabit && (
            <div className="opacity-90 rotate-1 shadow-2xl">
              <HabitCard
                habit={activeHabit}
                checkins={checkins[activeHabit.id] || []}
                isDone={isDoneToday(activeHabit.id)}
                onToggle={() => {}} onArchive={() => {}} onDelete={() => {}}
                dragHandleProps={{}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add button */}
      <div className="px-4 pt-2 pb-6">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 text-sm flex items-center justify-center gap-2 active:bg-neutral-50 dark:active:bg-neutral-900 transition-colors"
        >
          <Plus size={16} /> Add habit
        </button>
      </div>

      {showAdd && (
        <AddHabitSheet
          onClose={() => setShowAdd(false)}
          onSave={async (h) => { await onAdd(h); setShowAdd(false) }}
        />
      )}

      {pastDayDate && (
        <PastDaySheet
          date={pastDayDate}
          habits={habits}
          isDoneOn={isDoneOn}
          onToggle={onToggle}
          onClose={() => setPastDayDate(null)}
        />
      )}
    </div>
  )
}
