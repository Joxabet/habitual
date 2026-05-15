import { useState, useMemo } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { format, parseISO, isFuture, isToday } from 'date-fns'
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
import { PastDaySheet } from '../components/PastDaySheet'
import { getWeekDays, today, yesterday, missedYesterday } from '../lib/streaks'

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
    // Today — just show the normal view, no sheet
    if (day.date === todayStr) return
    // Past day — open the sheet
    const d = parseISO(day.date)
    if (!isFuture(d) || isToday(d)) {
      setPastDayDate(day.date)
    }
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
          <div className="flex items-center gap-2">
            {/* Past day picker button */}
            <button
              onClick={() => setPastDayDate(yest)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-500 active:bg-neutral-100 dark:active:bg-neutral-900 transition-colors"
              aria-label="Log a past day"
            >
              <CalendarDays size={13} />
              Past day
            </button>
          </div>
        </div>

        {/* Progress bar */}
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

      {/* Week strip — tappable past days */}
      <div className="flex px-3 mb-4">
        {weekDays.map(day => {
          const anyDone = habits.some(h => (checkins[h.id] || []).some(c => c.date === day.date))
          const isPast = day.date < todayStr
          return (
            <button
              key={day.date}
              onPointerDown={() => handleDayTap(day)}
              style={{ minHeight: 56 }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl ${
                isPast ? 'active:bg-neutral-100 dark:active:bg-neutral-900' : ''
              } transition-colors`}
              aria-label={isPast ? `Log habits for ${day.date}` : day.label}
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

      {/* Missed yesterday banner */}
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
          <p className="text-neutral-400 dark:text-neutral-600 text-xs mt-1 leading-relaxed">Start with one small habit. Tap the button below.</p>
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
                  <SortableHabitCard
                    key={h.id} habit={h}
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
                  <SortableHabitCard
                    key={h.id} habit={h}
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
                onToggle={() => {}}
                onArchive={() => {}}
                onDelete={() => {}}
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
