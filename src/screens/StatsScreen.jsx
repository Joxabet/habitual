import { useMemo } from 'react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { calcStreak, today, getEarnedMilestones, MILESTONES } from '../lib/streaks'
import { Flame, CheckCircle, TrendingUp, Calendar, Lock } from 'lucide-react'

export function StatsScreen({ habits, checkins }) {
  const stats = useMemo(() => {
    const allCheckins = Object.values(checkins).flat()
    const totalCheckins = allCheckins.length
    const bestStreak = habits.reduce((best, h) =>
      Math.max(best, calcStreak(checkins[h.id] || [], h)), 0)
    const weekStart = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    const weekCheckins = allCheckins.filter(c => c.date >= weekStart).length
    const weekExpected = habits.length * 7
    const weekRate = weekExpected > 0 ? Math.round((weekCheckins / weekExpected) * 100) : 0
    const days = eachDayOfInterval({ start: subDays(new Date(), 83), end: new Date() }).map(d => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const count = allCheckins.filter(c => c.date === dateStr).length
      const total = habits.length
      const level = total === 0 ? 0 : count === 0 ? 0 : count >= total ? 3 : count >= total / 2 ? 2 : 1
      return { date: dateStr, count, level }
    })
    const earned = getEarnedMilestones(habits, checkins)
    return { totalCheckins, bestStreak, weekRate, heatmap: days, earned }
  }, [habits, checkins])

  const LEVEL_COLORS = [
    'bg-neutral-200 dark:bg-neutral-800',
    'bg-green-200 dark:bg-green-900/60',
    'bg-green-400/60 dark:bg-green-600/60',
    'bg-green-500',
  ]

  const statCards = [
    { icon: Flame,       label: 'Best streak',    value: stats.bestStreak,    unit: 'days',       color: 'text-amber-500 dark:text-amber-400' },
    { icon: TrendingUp,  label: 'This week',       value: stats.weekRate+'%',  unit: 'completion', color: 'text-green-600 dark:text-green-400' },
    { icon: CheckCircle, label: 'Total check-ins', value: stats.totalCheckins, unit: 'logged',     color: 'text-blue-500 dark:text-blue-400' },
    { icon: Calendar,    label: 'Active habits',   value: habits.length,       unit: 'habits',     color: 'text-purple-500 dark:text-purple-400' },
  ]

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-neutral-950">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">Progress</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Your consistency over time</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-6">
        {statCards.map(({ icon: Icon, label, value, unit, color }) => (
          <div key={label} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
            <Icon size={15} className={`${color} mb-2`} />
            <div className="text-2xl font-medium font-mono text-neutral-900 dark:text-neutral-100">{value}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="px-4 mb-6">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-3">Activity — last 12 weeks</p>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
          {Array.from({ length: 12 }).map((_, week) => (
            <div key={week} className="flex flex-col gap-1">
              {stats.heatmap.slice(week * 7, week * 7 + 7).map(day => (
                <div key={day.date} className={`aspect-square rounded-sm ${LEVEL_COLORS[day.level]}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 justify-end">
          <span className="text-[10px] text-neutral-400 dark:text-neutral-600">Less</span>
          {LEVEL_COLORS.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
          <span className="text-[10px] text-neutral-400 dark:text-neutral-600">More</span>
        </div>
      </div>

      {/* Per-habit streaks */}
      {habits.length > 0 && (
        <div className="px-4 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-3">Habit streaks</p>
          <div className="flex flex-col gap-2">
            {habits.map(h => {
              const streak = calcStreak(checkins[h.id] || [], h)
              const pct = Math.min(100, Math.round((streak / 30) * 100))
              return (
                <div key={h.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{h.name}</span>
                    <span className="text-xs font-mono text-amber-500 dark:text-amber-400 flex items-center gap-1">
                      <Flame size={10} />{streak}d
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="px-4 mb-8">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-3">Milestones</p>
        <div className="grid grid-cols-2 gap-2">
          {MILESTONES.map(m => {
            const earned = stats.earned.some(e => e.id === m.id)
            return (
              <div key={m.id} className={`p-3 rounded-2xl border flex items-center gap-3 ${
                earned
                  ? 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700'
                  : 'bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-100 dark:border-neutral-800/50'
              }`}>
                <div className={`text-2xl flex-shrink-0 ${earned ? '' : 'grayscale opacity-30'}`}>
                  {m.emoji}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium leading-tight ${
                    earned ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400 dark:text-neutral-600'
                  }`}>
                    {m.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 leading-tight ${
                    earned ? 'text-neutral-500' : 'text-neutral-300 dark:text-neutral-700'
                  }`}>
                    {m.desc}
                  </p>
                </div>
                {!earned && <Lock size={11} className="text-neutral-300 dark:text-neutral-700 flex-shrink-0 ml-auto" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
