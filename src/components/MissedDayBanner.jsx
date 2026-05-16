import { RotateCcw, X } from 'lucide-react'

export function MissedDayBanner({ habits, onLogYesterday, onDismiss }) {
  const missedHabits = habits.filter(h => h._missedYesterday)
  if (missedHabits.length === 0) return null

  return (
    <div className="mx-4 mb-3 bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-0.5">Missed yesterday?</p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {missedHabits.length === 1
              ? `You didn't log "${missedHabits[0].name}" yesterday.`
              : `You missed ${missedHabits.length} habits yesterday.`
            } Log them now to keep your streak.
          </p>
        </div>
        <button onClick={onDismiss} className="flex-shrink-0 p-1 text-neutral-400 active:text-neutral-600">
          <X size={16} />
        </button>
      </div>
      <button
        onClick={onLogYesterday}
        className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 py-1"
      >
        <RotateCcw size={13} />
        Log yesterday's habits
      </button>
    </div>
  )
}
